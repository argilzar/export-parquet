import { ux } from "@oclif/core";
import merge from "deepmerge";
import { load } from "js-yaml";
import fs from "node:fs";

import { combineMerge } from "./combine-merge.util.js";
import { readPipe } from "./read-pipe.util.js";

export interface Parser<T> {
	parse(raw: unknown): T;
}

export const FetchManifestUtil = {
	async fetchManifest<T>(files: string[], parser: Parser<T>): Promise<T> {
		const contents: string[] = [];
		for (const file of files) {
			if (file === "-") {
				// eslint-disable-next-line no-await-in-loop
				contents.push((await readPipe()) || "");
			} else if (fs.existsSync(file)) {
				contents.push(fs.readFileSync(file, "utf8"));
			} else {
				ux.error(`File not found: ${file}`);
			}
		}

		if (contents.length === 0) {
			ux.error("No file content found");
		}

		let rawYaml: unknown;
		for (const content of contents) {
			try {
				const parsed = load(content);

				if (!parsed) {
					continue;
				}

				if (!rawYaml) {
					rawYaml = parsed;
					continue;
				}

				rawYaml = merge(rawYaml as never, parsed, {
					arrayMerge: combineMerge,
				});
			} catch (error) {
				ux.error(`Invalid YAML: ${error}`);
			}
		}

		let yaml: T;
		try {
			yaml = parser.parse(rawYaml);
		} catch (error) {
			ux.error(`Invalid YAML: ${error}`);
		}

		if (!yaml) {
			ux.error("Invalid YAML");
		}

		return yaml;
	},
};
