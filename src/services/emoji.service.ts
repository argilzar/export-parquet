import type { Logger } from "@flowcore/cli-plugin-config";
import type {
	OutputService,
	SourceEvent,
	StreamFlags,
} from "@flowcore/cli-plugin-core";

import { ux } from "@oclif/core";

export class EmojiService implements OutputService {
	constructor(private readonly logger: Logger) {}

	// this is called when the stream is done, but only if the stream is not live
	async done(): Promise<void> {
		this.logger.info(ux.colorize("green", "Done!!! 🥳"));
	}

	// this is called for each error in the stream
	async error(error: Error): Promise<void> {
		this.logger.error(error.message);
	}

	// this is the description of the output processor, used in the help command
	getDescription(): string {
		return "Emojify the output";
	}

	// this is the name of the output processor
	getName(): string {
		return "emojify";
	}

	// this is called for each event in the stream
	async process(
		event: SourceEvent,
		_streamFlags: StreamFlags,
		_complete: () => void,
	): Promise<void> {
		const emojiEvent = {
			...event,
			emoji: "😎",
		};
		this.logger.info(JSON.stringify(emojiEvent));

		// if you want to stop the stream on demand you can call complete()
		// this is useful if you want to stop the stream after a certain number of events
		// but don't forget to call it!
		// complete();
	}

	// this is called before the stream is started
	async start(): Promise<void> {
		this.logger.info(ux.colorize("green", "Starting stream... 🚀"));
	}
}
