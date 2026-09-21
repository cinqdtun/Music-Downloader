import { Config } from '@/types'
import { app } from 'electron'

import fs from 'fs'
import path from 'path'

export const userDir = app.getPath('userData');
export const configFile = path.join(userDir, 'config.json');

const DEFAULT_CONFIG: Config = {
	adBlocker: true,
	autoSave: true,
	lang: 'system',
	defaultLocation: app.getPath('documents'),
	embedTags: true,
	embedThumbnail: true,
	forceIpv4: false,
	output: "artist-and-title-out",
	format: "mp3",
	downloadsArgs: ""
};

export function openConfig() : Config {
	try {
		const configStr = fs.readFileSync(configFile, "utf-8");
		const configJSON = JSON.parse(configStr);
		
		return sanitizeConfig(configJSON);
	} catch (ex: any) {
		console.error(ex);
	}
	return { ...DEFAULT_CONFIG };
}

export function writeConfig(cfg: Config) : boolean {
	try {
		const fileStr = JSON.stringify(cfg);
		
		fs.writeFileSync(configFile, fileStr, { encoding: "utf-8", flag: 'w'});
		
		return true;
	} catch (ex: any) {
		console.error(ex);
	}
	
	return false;
}

function sanitizeConfig(raw: unknown): Config {
	if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
		return { ...DEFAULT_CONFIG };
	}

	const fields = raw as Record<string, unknown>;
	const result: Config = { ...DEFAULT_CONFIG };

	for (const key of Object.keys(DEFAULT_CONFIG) as (keyof Config)[]) {
		if (key in fields && typeof fields[key] === typeof DEFAULT_CONFIG[key]) {
			result[key] = fields[key] as never;
		}
	}

	return result;
}