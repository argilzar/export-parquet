# Flowcore CLI Plugin - Export Parquet

Plugin to export data from the flowcore platform as parquet files using DuckDB via the modern `@duckdb/node-api` package for efficient data processing and storage.

[![Version](https://img.shields.io/npm/v/@argilzar/cli-plugin-export-parquet)](https://npmjs.org/package/@argilzar/cli-plugin-export-parquet)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
* [Flowcore CLI Plugin - Export Parquet](#flowcore-cli-plugin---export-parquet)
* [Export with default timestamped filename](#export-with-default-timestamped-filename)
* [Export with custom filename (extension automatically added)](#export-with-custom-filename-extension-automatically-added)
* [Export with custom filename (extension already included)](#export-with-custom-filename-extension-already-included)
* [Using short flag](#using-short-flag)
* [Export with custom output directory](#export-with-custom-output-directory)
* [Export with custom filename and output directory](#export-with-custom-filename-and-output-directory)
* [Using short flags](#using-short-flags)
* [Export last year's data](#export-last-years-data)
* [Export specific date range](#export-specific-date-range)
* [Live streaming export](#live-streaming-export)
* [Install dependencies](#install-dependencies)
* [Build the project](#build-the-project)
* [Run tests](#run-tests)
* [Run linter](#run-linter)
<!-- tocstop -->

## Overview

The Export Parquet plugin for Flowcore CLI allows you to stream data from Flowcore data cores and export it directly to Parquet files. It uses DuckDB via the modern `@duckdb/node-api` package for in-memory data processing, making it efficient for handling large volumes of streaming data.

## Installation

```bash
npm install -g @argilzar/cli-plugin-export-parquet
```

## Usage

### Basic Usage
```bash
# Export with default timestamped filename
flowcore export-parquet "https://flowcore.io/<org>/<Data Core>/*" -s 1y --no-live
```

### Custom Filename with CLI Flag
```bash
# Export with custom filename (extension automatically added)
flowcore export-parquet "https://flowcore.io/<org>/<Data Core>/*" -s 1y --no-live --filename brian

# Export with custom filename (extension already included)
flowcore export-parquet "https://flowcore.io/<org>/<Data Core>/*" -s 1y --no-live --filename brian.parquet

# Using short flag
flowcore export-parquet "https://flowcore.io/<org>/<Data Core>/*" -s 1y --no-live -f brian

# Export with custom output directory
flowcore export-parquet "https://flowcore.io/<org>/<Data Core>/*" -s 1y --no-live --output-dir /path/to/exports

# Export with custom filename and output directory
flowcore export-parquet "https://flowcore.io/<org>/<Data Core>/*" -s 1y --no-live --filename brian --output-dir /path/to/exports

# Using short flags
flowcore export-parquet "https://flowcore.io/<org>/<Data Core>/*" -s 1y --no-live -f brian -o /path/to/exports
```

### Custom Filename (Programmatic)
```typescript
// Create service with custom filename
const exportService = new ExportParquetService(logger, "my-custom-export.parquet");
```

### Programmatic Usage
```typescript
import { ExportParquetService } from "@flowcore/cli-plugin-export-parquet";

// With default filename (timestamped) and default output directory
const service = new ExportParquetService(logger);

// With custom filename (extension automatically added) and default output directory
const service = new ExportParquetService(logger, "my-export");

// With custom filename (extension already included) and default output directory
const service = new ExportParquetService(logger, "my-export.parquet");

// With custom filename and custom output directory
const service = new ExportParquetService(logger, "my-export", "/path/to/exports");

// With default filename and custom output directory
const service = new ExportParquetService(logger, undefined, "/path/to/exports");
```

**Note**: The `.parquet` extension is automatically added if not provided. Both `"my-export"` and `"my-export.parquet"` will result in the same filename.

## Commands

### `export-parquet <STREAM>`

Export data from a Flowcore stream as parquet files.

**Arguments:**
- `STREAM` - The stream URL in the format `https://flowcore.io/<org>/<Data Core>/*`

**Flags:**
- `-s, --start=<value>` - Start time for the export (e.g., "1y", "2024-01-01")
- `-e, --end=<value>` - End time for the export (e.g., "2024-12-31")
- `--live` - Enable live streaming (continuous export)
- `--no-live` - Disable live streaming (one-time export)
- `-f, --filename=<value>` - Custom filename for the parquet export (`.parquet` extension automatically added)
- `-o, --output-dir=<value>` - Custom output directory for the parquet file (default: `./exports`)

**Examples:**
```bash
# Export last year's data
export-parquet "https://flowcore.io/myorg/mydatacore/*" -s 1y --no-live

# Export specific date range
export-parquet "https://flowcore.io/myorg/mydatacore/*" -s 2024-01-01 -e 2024-12-31 --no-live

# Live streaming export
export-parquet "https://flowcore.io/myorg/mydatacore/*" --live
```

## Features

- **Modern DuckDB Integration**: Uses `@duckdb/node-api` for the latest DuckDB features and performance
- **Streaming Support**: Handles both batch and live streaming data
- **Intelligent Schema Detection**: Automatically analyzes payload structures and creates appropriately typed columns
- **Dynamic Schema Evolution**: Automatically adds new columns as payload structures are discovered
- **Native Data Type Preservation**: Stores values in their native types (numbers, booleans, timestamps) instead of JSON strings
- **Proper Timestamp Handling**: Correctly handles ISO 8601 datetime strings without conversion errors
- **Unix Timestamp Detection**: Automatically detects Unix timestamps in numeric values and creates TIMESTAMP columns
- **Automatic Unix Timestamp Conversion**: Converts Unix timestamps to ISO 8601 strings before inserting into DuckDB
- **Intelligent Type Memory**: Remembers detected column types and only performs conversions when necessary
- **Custom Filename Support**: Allows specifying custom filenames for parquet exports
- **Custom Output Directory**: Allows specifying custom output directories for parquet files
- **Timestamped Output**: Generates timestamped parquet files
- **Progress Tracking**: Shows progress during export operations
- **Error Handling**: Robust error handling with detailed logging

## How It Works

1. **Initialization**: The service initializes an in-memory DuckDB database using `@duckdb/node-api`
2. **Streaming**: As events arrive, they are processed and stored in DuckDB
3. **Dynamic Schema**: The service automatically analyzes payload structures and creates new columns with appropriate data types
4. **Type Memory**: Column types are stored in memory for efficient future reference
5. **Data Processing**: Each event stores flowcore metadata in a single JSON field and spreads payload fields as individually typed columns
6. **Type Preservation**: Values are stored in their native types (e.g., numbers as numbers, not quoted strings)
7. **Smart Timestamp Detection**: Automatically detects both string-based and numeric Unix timestamps
8. **Conditional Conversion**: Unix timestamps are only converted when the column type requires it
9. **Export**: When the stream completes, data is exported to a timestamped parquet file
10. **Cleanup**: Database connections are properly closed

## Output

- **Location**: Files are saved to the `./exports/` directory by default, or to a custom directory if specified
- **Naming**: Files follow the pattern `events_YYYY-MM-DDTHH-MM-SS-sssZ.parquet` by default
- **Custom Filenames**: Can be customized by passing a filename parameter to the service constructor
- **Custom Output Directories**: Can be customized by passing an outputDir parameter to the service constructor
- **Format**: Standard Parquet format for optimal compression and query performance
- **Structure**: Each row contains:
  - **`flowcore`** (JSON): Complete SourceEvent metadata excluding payload:
    - `eventId`: Unique event identifier
    - `dataCoreId`: Data core ID
    - `flowType`: Flow type name
    - `eventType`: Event type name
    - `timeBucket`: Time bucket for the event
    - `metadata`: Event metadata
    - `validTime`: Event validity timestamp
  - **Payload Fields** (auto-discovered with intelligent typing):
    - **Numeric Fields**: `BIGINT` for integers, `DOUBLE` for decimals (stored as native numbers)
    - **String Fields**: `VARCHAR` for text data (stored as native strings)
    - **DateTime Fields**: `TIMESTAMP` for date/time strings and Unix timestamps (stored as native timestamps)
    - **Boolean Fields**: `BOOLEAN` for true/false values (stored as native booleans)
    - **Complex Fields**: `JSON` for objects and arrays (stored as JSON strings)
    - **Unix Timestamp Detection**: Automatically detects numeric Unix timestamps (10, 13, or 16 digits) and creates TIMESTAMP columns
    - **Unix Timestamp Conversion**: Converts Unix timestamps to ISO 8601 strings before insertion to ensure proper DuckDB compatibility
    - **Type Memory System**: Remembers detected column types to avoid unnecessary conversions on subsequent events
    - Field names match exactly as they appear in the payload
    - These fields are automatically created with appropriate types as they are discovered in the event stream
    - **No Double Quotes**: Numeric, boolean, and timestamp values are stored without quotes, preserving their native types

## Requirements

- Node.js >= 18.0.0
- Flowcore CLI with proper authentication
- Access to the target data core

## Dependencies

- **@duckdb/node-api**: Modern Node.js API for DuckDB database operations
- **@flowcore/cli-plugin-core**: Core Flowcore CLI functionality
- **@flowcore/cli-plugin-config**: Configuration management

## Development

```bash
# Install dependencies
yarn install

# Build the project
yarn build

# Run tests
yarn test

# Run linter
yarn lint
```

## Architecture

The plugin consists of:

- **ExportParquetService**: Core service implementing the OutputService interface
- **DuckDB Integration**: In-memory database using `@duckdb/node-api` for data processing
- **Stream Processing**: Handles the Flowcore event stream lifecycle
- **Parquet Export**: Converts processed data to parquet format

## License

MIT
