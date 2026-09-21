import { app } from "electron"
import path from "node:path"
import { createHash } from 'node:crypto'
import { Music } from "@/types"

export function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function resolveBinaryPath(relativePath: string): string {
	if (app.isPackaged) {
		return path.join(process.resourcesPath, relativePath);
	}

	return path.join(app.getAppPath(), relativePath);
}

export function sanitizeMetadata(str: string) : string {
	return str.replace(/[<>:"/\\|?*\x00-\x1F]/g, "")	// Windows forbbiden characters: < > : " / \ | ? * and characters from 0x00(0) to 0x1F(31)
														// Linux forbbiden characters: / and character 0x00(0)
		.replace(/\s+/g, " ") 							// Transform multi spaces to just one space
		.trim()
}

export function computePlaylistHash(array: Music[]) {
	const hasher = createHash('sha256');

	for (let i = 0; i < array.length; i++) {
		const item = array[i];

		const chunk = JSON.stringify(item, Object.keys(item).sort());

		hasher.update(chunk);
		hasher.update('\0');
	}

	return hasher.digest('hex');
}