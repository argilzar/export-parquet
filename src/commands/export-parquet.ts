import {
	BaseStreamCommand,
	STREAM_ARGS,
	STREAM_FLAGS,
} from "@flowcore/cli-plugin-core";
import pkg from "dayjs";
const { extend } = pkg;

import { Flags } from "@oclif/core";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

import { ExportParquetService } from "../services/export-parquet.service.js";

extend(customParseFormat);

export default class ExportParquetStream extends BaseStreamCommand<
	typeof ExportParquetStream
> {
	static args = STREAM_ARGS;

	static description = "Export data as parquet files";
	static examples = [
		'<%= config.bin %> <%= command.id %> "https://flowcore.io/<org>/<Data Core>/*" -s 1y --no-live',
	];

	static flags = {
		...STREAM_FLAGS,
		filename: Flags.string({
			char: "f",
			description: "Name or prefix for the parquet files",
			helpValue: "events",
			name: "filename",
			required: false,
		}),
		outputDir: Flags.string({
			char: "o",
			description: "Output directory for the parquet files",
			helpValue: "./exports",
			name: "outputDir",
			required: false,
		}),
	};

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(ExportParquetStream);

		const exportParquetService = new ExportParquetService(
			this.logger,
			flags.filename,
			flags.outputDir,
		);

		// register the export parquet service as an output processor
		this.newStreamService.registerOutputProcessor(exportParquetService);

		// initialize the stream service with the stream url and the output processor
		await this.newStreamService.init(args.STREAM, {
			...flags,
			output: "export-parquet",
		});

		await this.newStreamService.startStream();
	}
}
