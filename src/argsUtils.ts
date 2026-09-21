import { FFMPEG_PATH, JS_RUNTIME_PATH } from "./constants/main"
import { Config } from "./types"

function parseArgsToArgv(str: string) : string[] {
	const argv: string[] = [];
	let curr: string = '';
	let quote: string | null = null;
	let escaped = false;
	let isEmpty = true;

	for (let i = 0; i < str.length; ++i) {
		const char = str[i];

		if (escaped) {
			// Escaped character logic
			curr += char;
			escaped = false;
		} else if (char === '\\') {
			// Escape token logic
			escaped = true;
		} else if (char === quote) {
			// Leave quote logic
			quote = null;
		} else if (!quote && (char === '\'' || char === '\"')) {
			// Enter quote logic
			quote = char;
			isEmpty = false;
		} else if (!quote && (char === ' ' || char === '\n' || char === '\t' || char === "\r")) {
			// Whitespaces split logic
			if (!isEmpty) {
				argv.push(curr);
				curr = '';
				isEmpty = true;
			}
		} else {
			// No special case just build arg
			curr += char;
			isEmpty = false;
		}		
	}

	// Append backslash as it have no character to escape
	if (escaped) {
		curr += '\\';
		isEmpty = false;
	}

	// Push final arg if non empty
	if (!isEmpty) {
		argv.push(curr);
	}

	return argv;
}

export function getDownloadArgs(config: Config) : string[] {
	let args: string[] = [];

	// JS runtime path and FFMPEG 
	args = args.concat([
		"--js-runtimes",
		`quickjs:${JS_RUNTIME_PATH}`,
		"--ffmpeg-location",
		FFMPEG_PATH
	]);

	// Set fallback if best format is not present
	args = args.concat([
		 "-f", "bestaudio[ext=webm]/bestaudio/best"
	]);

	// Player type (visionos player seems to be the best at this time)
	args = args.concat([
		"--extractor-args", "youtube:player_client=web,visionos"
	]);

	// Add tiny delay between requests to prevent spamming API
	args = args.concat([
		"--sleep-requests", "0.25", 
		"--min-sleep-interval", "0.2",
		"--max-sleep-interval", "0.4"
	]);

	// Specify file format
	if (config.format === "mp3") {
		args = args.concat([
			"-x",
			"--audio-format",
			"mp3",
			"--audio-quality",
			"0"
		]);
	} else if (config.format === "m4a") {
		args = args.concat([
			"-x",
			"--audio-format",
			"m4a"
		]);
	} else if (config.format === "opus") {
		args =args.concat([
			"-x",
			"--audio-format",
			"opus"
		]);
	}

	// Embed thumbnail
	if (config.embedThumbnail) {
		args.push("--embed-thumbnail");
	}

	// Add metadata
	if (config.embedTags) {
		args.push("--add-metadata");
	}

	// IPv4 workaround
	if (config.forceIpv4) {
		args.push("-4");
	}
	
	// Filename formatting
	if (config.output === "artist-and-title-out") {
		args = args.concat([
			"-o",
			"%(artist&{}|Unknown Artist)s%(title)s.%(ext)s"
		]);
	} else if (config.output === "flat-out") {
		args = args.concat([
			"-o",
			"%(title)s.%(ext)s"
		]);
	} else if (config.output === "subfolders-out") {
		args = args.concat([
			"-o",
			"%(artist&{}|Unknown Artist)s/%(title)s.%(ext)s"
		]);
	}

	// Set output location
	if (config.defaultLocation.trim().length > 0) {
		args = args.concat([
			"-P",
			config.defaultLocation.trim()
		]);
	}

	// Apply custom args
	args = args.concat(parseArgsToArgv(config.downloadsArgs));

	return args;
}