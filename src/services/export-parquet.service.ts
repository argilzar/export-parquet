/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Logger } from "@flowcore/cli-plugin-config";
import type {
	OutputService,
	SourceEvent,
	StreamFlags,
} from "@flowcore/cli-plugin-core";

import * as duckdb from "@duckdb/node-api";
import { ux } from "@oclif/core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export class ExportParquetService implements OutputService {
	private connection: duckdb.DuckDBConnection | null = null;
	private customFilename?: string;
	private db: duckdb.DuckDBInstance | null = null;
	private eventCount = 0;
	private outputDir = "./exports";
	private payloadFields: Set<string> = new Set();
	private payloadFieldTypes: Map<string, string> = new Map(); // Track column types
	private tableName = "events";

	constructor(
		private readonly logger: Logger,
		customFilename?: string,
		outputDir?: string,
	) {
		// Automatically add .parquet extension if not present
		this.customFilename =
			customFilename && !customFilename.endsWith(".parquet")
				? `${customFilename}.parquet`
				: customFilename;

		// Use custom output directory if provided, otherwise use default
		if (outputDir) {
			this.outputDir = outputDir;
		}
	}

	// this is called when the stream is done, but only if the stream is not live
	async done(): Promise<void> {
		try {
			if (!this.connection || !this.db) {
				this.logger.error("DuckDB database not initialized");
				return;
			}

			this.logger.info(
				ux.colorize("blue", `Processing ${this.eventCount} events... 🔄`),
			);

			// Create output directory if it doesn't exist
			mkdirSync(this.outputDir, { recursive: true });

			// Generate filename with timestamp
			const timestamp = new Date().toISOString().replaceAll(/[.:]/g, "-");
			const filename = this.customFilename || `events_${timestamp}.parquet`;
			const filepath = join(this.outputDir, filename);

			// Export to parquet file
			const exportQuery = `COPY (SELECT * FROM ${this.tableName}) TO '${filepath}' (FORMAT PARQUET,COMPRESSION GZIP)`;

			await this.connection.run(exportQuery);

			this.logger.info(
				ux.colorize(
					"green",
					`Export completed! 📊 Exported ${this.eventCount} events to ${filepath}`,
				),
			);

			// Close database connection
			this.connection.closeSync();
			this.db.closeSync();
		} catch (error) {
			this.logger.error(
				`Error during export: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	// this is called for each error in the stream
	async error(error: Error): Promise<void> {
		this.logger.error(error.message);
	}

	// this is the description of the output processor, used in the help command
	getDescription(): string {
		return "Export data as parquet files using DuckDB";
	}

	// this is the name of the output processor
	getName(): string {
		return "export-parquet";
	}

	// this is called for each event in the stream
	async process(
		event: SourceEvent,
		_streamFlags: StreamFlags,
		_complete: () => void,
	): Promise<void> {
		try {
			if (!this.connection) {
				this.logger.error("Database connection not initialized");
				return;
			}

			// Analyze payload structure and add new fields if needed
			if (event.payload && typeof event.payload === "object") {
				await this.analyzeAndAddPayloadFields(
					event.payload as Record<string, unknown>,
				);
			}

			// Build dynamic insert query with flowcore JSON field and payload fields
			const baseFields = ["flowcore"];
			const allFields = [...baseFields, ...this.payloadFields];
			const placeholders = allFields.map(() => "?").join(", ");

			const insertQuery = `INSERT INTO ${this.tableName} (${allFields.join(", ")}) VALUES (${placeholders})`;

			// Build values array
			const values: (null | unknown)[] = [];

			// Add flowcore data as JSON
			const flowcoreData = {
				dataCoreId: event.dataCoreId,
				eventId: event.eventId,
				eventType: event.eventType,
				flowType: event.flowType,
				metadata: event.metadata,
				timeBucket: event.timeBucket,
				validTime: event.validTime,
			};
			values.push(JSON.stringify(flowcoreData));

			// Add payload field values
			if (event.payload && typeof event.payload === "object") {
				const payload = event.payload as Record<string, unknown>;
				for (const fieldName of this.payloadFields) {
					const payloadValue = payload[fieldName];
					if (payloadValue === undefined) {
						values.push(null);
					} else {
						// Convert Unix timestamps to proper timestamp values
						const convertedValue = this.convertValueForColumn(
							payloadValue,
							fieldName,
						);
						values.push(convertedValue);
					}
				}
			} else {
				// Add null values for payload fields if no payload
				for (let i = 0; i < this.payloadFields.size; i++) {
					values.push(null);
				}
			}

			// Insert into DuckDB table
			const stmt = await this.connection.prepare(insertQuery);

			// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for DuckDB compatibility
			stmt.bind(values as any);
			await stmt.run();
			stmt.destroySync();

			this.eventCount++;

			if (this.eventCount % 100 === 0) {
				this.logger.info(
					ux.colorize("blue", `Processed ${this.eventCount} events... 📈`),
				);
			}
		} catch (error) {
			this.logger.error(
				`Error processing event ${event.eventId}: ${error instanceof Error ? error.message : String(error)}`,
			);
			console.log(event);
		}
	}

	// this is called before the stream is started
	async start(): Promise<void> {
		try {
			this.logger.info(
				ux.colorize(
					"green",
					"Starting parquet export stream with DuckDB... 📁",
				),
			);

			// Initialize DuckDB
			this.db = await duckdb.DuckDBInstance.create();
			this.connection = await this.db.connect();

			// Create table for events with flowcore JSON field
			const createTableQuery = `
				CREATE TABLE ${this.tableName} (
					flowcore JSON
				)
			`;

			await this.connection.run(createTableQuery);

			this.logger.info(
				ux.colorize("green", "DuckDB initialized and ready for streaming! 🦆"),
			);
		} catch (error) {
			this.logger.error(
				`Error initializing DuckDB: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}

	// Analyze payload structure and add new fields to the table
	private async analyzeAndAddPayloadFields(
		payload: Record<string, unknown>,
	): Promise<void> {
		if (!this.connection) return;

		const newFields: string[] = [];

		for (const key of Object.keys(payload)) {
			if (!this.payloadFields.has(key)) {
				newFields.push(key);
				this.payloadFields.add(key);
			}
		}

		// Add new columns to the table sequentially to avoid await in loop issues
		for (const fieldName of newFields) {
			try {
				const payloadValue = payload[fieldName];
				const columnType = this.guessColumnType(payloadValue, fieldName);

				// Store the detected column type for future reference
				this.payloadFieldTypes.set(fieldName, columnType);

				const alterQuery = `ALTER TABLE ${this.tableName} ADD COLUMN ${fieldName} ${columnType}`;
				// eslint-disable-next-line no-await-in-loop
				await this.connection.run(alterQuery);
				this.logger.info(
					ux.colorize(
						"blue",
						`Added new column: ${fieldName} (${columnType}) 📊`,
					),
				);
			} catch (error) {
				// Column might already exist or be incompatible
				this.logger.debug(
					`Could not add column ${fieldName}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	}

	// Convert Unix timestamps to proper timestamp values for DuckDB
	private convertValueForColumn(value: unknown, fieldName: string): unknown {
		// Get the stored column type for this field
		const columnType = this.payloadFieldTypes.get(fieldName);

		// Only convert if the column type is TIMESTAMP and the value is a Unix timestamp
		if (
			columnType === "TIMESTAMP" &&
			typeof value === "number" &&
			this.isUnixTimestamp(value)
		) {
			// Convert Unix timestamp to ISO string for DuckDB
			let convertedValue: string;
			if (value >= 1_000_000_000_000) {
				// Milliseconds timestamp
				const date = new Date(value);
				convertedValue = date.toISOString();
			} else {
				// Seconds timestamp
				const date = new Date(value * 1000);
				convertedValue = date.toISOString();
			}

			this.logger.debug(
				ux.colorize(
					"yellow",
					`Converting Unix timestamp ${value} to ${convertedValue} for field ${fieldName} 🔄`,
				),
			);

			return convertedValue;
		}

		if (columnType === "JSON") {
			return JSON.stringify(value);
		}

		// For other types or when conversion is not needed, return the value as is
		return value;
	}

	// Guess the appropriate column type based on the payload value
	private guessColumnType(value: unknown, fieldName?: string): string {
		if (value === null || value === undefined) {
			return "VARCHAR"; // Default to VARCHAR for null/undefined values
		}

		if (typeof value === "string") {
			// Check if it's a datetime string
			if (this.isDateTimeString(value)) {
				return "TIMESTAMP";
			}

			return "VARCHAR";
		}

		if (typeof value === "number") {
			// Check if it's a Unix timestamp first, but exclude fields ending with "id"
			if (
				fieldName &&
				!fieldName.toLowerCase().endsWith("id") &&
				this.isUnixTimestamp(value)
			) {
				return "TIMESTAMP";
			}

			// Check if it's an integer
			if (Number.isInteger(value)) {
				// Check if the number exceeds BIGINT limits
				if (
					value > Number.MAX_SAFE_INTEGER ||
					value < Number.MIN_SAFE_INTEGER
				) {
					// For extremely large integers, use DECIMAL with high precision
					// or VARCHAR as fallback for numbers that might exceed DECIMAL limits
					const valueStr = value.toString();
					return valueStr.length > 38
						? "VARCHAR" // If the number is extremely long, use VARCHAR to preserve exact value
						: "DECIMAL(38,0)"; // Use DECIMAL with appropriate precision for large but manageable numbers
				}

				return "BIGINT";
			}

			// For non-integer numbers, check if they exceed DOUBLE precision limits
			if (Math.abs(value) > Number.MAX_VALUE) {
				// If the number exceeds JavaScript's MAX_VALUE, use VARCHAR to preserve exact value
				return "VARCHAR";
			}

			return "DOUBLE";
		}

		if (typeof value === "boolean") {
			return "BOOLEAN";
		}

		if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
			return "JSON";
		}

		// Default fallback
		return "VARCHAR";
	}

	// Check if a string represents a datetime
	private isDateTimeString(value: string): boolean {
		// Common datetime patterns
		const dateTimePatterns = [
			// ISO 8601 format
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
			// ISO date format
			/^\d{4}-\d{2}-\d{2}$/,
			// ISO time format
			/^\d{2}:\d{2}:\d{2}(\.\d{3})?$/,
			// Unix timestamp (seconds since epoch)
			/^\d{10}$/,
			// Unix timestamp (milliseconds since epoch)
			/^\d{13}$/,
			// Common date formats
			/^(?:\d{1,2}\/){2}\d{4}$/,
			/^(?:\d{1,2}-){2}\d{4}$/,
			// RFC 2822 format
			/^[A-Za-z]{3}, \d{1,2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/,
		];

		return dateTimePatterns.some((pattern) => pattern.test(value));
	}

	// Check if a number represents a Unix timestamp
	private isUnixTimestamp(value: number): boolean {
		// Unix timestamp in seconds (10 digits) - from 2001 to 2286
		if (value >= 1_000_000_000 && value <= 9_999_999_999) {
			return true;
		}

		// Unix timestamp in milliseconds (13 digits) - from 2001 to 2286
		if (value >= 1_000_000_000_000 && value <= 9_999_999_999_999) {
			return true;
		}

		// Unix timestamp in microseconds (16 digits) - from 2001 to 2286
		// Use string length check to avoid precision issues
		const valueStr = value.toString();
		if (valueStr.length === 16 && value >= 1_000_000_000_000_000) {
			return true;
		}

		return false;
	}
}
