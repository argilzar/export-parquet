// src/commands/stream/emojify.ts

import { BaseStreamCommand, STREAM_ARGS } from "@flowcore/cli-plugin-core";
import pkg from "dayjs";
const { extend } = pkg;

import customParseFormat from "dayjs/plugin/customParseFormat.js";

import { EmojiService } from "../services/emoji.service.js";

extend(customParseFormat);

export default class EmojifyStream extends BaseStreamCommand<
	typeof EmojifyStream
> {
	static args = STREAM_ARGS;

	static description = "Emojify the output";
	static examples = [
		'<%= config.bin %> <%= command.id %> "https://flowcore.io/<org>/<Data Core>/*" -s 1y --no-live',
	];

	static flags = {
		// add flags to the command to pass to the output processor
	};

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(EmojifyStream);

		const emojiService = new EmojiService(this.logger);

		// register the emoji service as an output processor
		this.newStreamService.registerOutputProcessor(emojiService);

		// initialize the stream service with the stream url and the output processor
		await this.newStreamService.init(args.STREAM, {
			...flags,
			output: "emojify",
		});

		await this.newStreamService.startStream();
	}
}
