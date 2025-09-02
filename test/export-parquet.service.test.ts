import { expect } from "chai";

import { ExportParquetService } from "../src/services/export-parquet.service.js";

// Mock logger with minimal required methods
const mockLogger = {
	child() {
		return mockLogger;
	},
	debug() {},
	error() {},
	fatal() {},
	info() {},
	namespace: "",
	prefix: "",
	trace() {},
	warn() {},
};

describe("ExportParquetService", () => {
	let service: ExportParquetService;

	beforeEach(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		service = new ExportParquetService(mockLogger as any);
	});

	describe("getName", () => {
		it("should return the correct service name", () => {
			expect(service.getName()).to.equal("export-parquet");
		});
	});

	describe("getDescription", () => {
		it("should return the correct description", () => {
			expect(service.getDescription()).to.equal(
				"Export data as parquet files using DuckDB",
			);
		});
	});

	describe("error handling", () => {
		it("should handle errors correctly", () => {
			const error = new Error("Test error");
			expect(() => service.error(error)).to.not.throw();
		});
	});

	describe("basic functionality", () => {
		it("should be instantiable", () => {
			expect(service).to.be.instanceOf(ExportParquetService);
		});
	});
});
