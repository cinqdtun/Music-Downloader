import fs from 'fs'
import { MainContext, PlaylistFile } from '@/types';
import { dialog } from 'electron';
import { DEFAULT_FILE, DEFAULT_FOLDER } from '@/constants/main';
import { IPC_CHANNELS } from '@/constants/shared';
import { isMusicPresent } from '@/musicUtils';
import { updateMainTitle } from '@/windowUtils';
import { computePlaylistHash } from './utils';

function openPlaylist(path: string) : PlaylistFile | null {
	try {
		const fileStr = fs.readFileSync(path, "utf-8");
		const fileData = JSON.parse(fileStr);

		if (!fileData.format || !fileData.version || fileData.format != 'md-playlist' || fileData.version != 1) {
			console.error("Invalid file format");
			return null;
		}

		if (!fileData.uuid) {
			console.error("Invalid UUID");
			return null;
		}

		if (!fileData.musics) {
			console.error("Invalid musics");
			return null;
		}

		for (const music of fileData.musics) {
			if (!music || !music.cover || !music.title || !music.artist || !music.duration || !music.id || !music.platform) {
				console.error("Invalid musics fields");
				return null;
			}

			if ((music.cover as string).trim().length < 1) {
				console.error("Invalid musics fields");
				return null;
			}

			if ((music.title as string).trim().length < 1) {
				console.error("Invalid musics fields");
				return null;
			}

			if ((music.artist as string).trim().length < 1) {
				console.error("Invalid musics fields");
				return null;
			}

			if ((music.duration as string).trim().length < 1) {
				console.error("Invalid musics fields");
				return null;
			}

			if ((music.id as string).trim().length < 1) {
				console.error("Invalid musics fields");
				return null;
			}

			if ((music.platform as string).trim().length < 1) {
				console.error("Invalid musics fields");
				return null;
			}

			if ((music.platform as string) !== "youtube") {
				console.error("Invalid musics platform");
				return null;
			}
		}

		const file = {
			path: path,
			uuid: fileData.uuid,
			musics: fileData.musics
		} as PlaylistFile;

		return file;
	} catch (ex: any) {
		console.error(ex);
	}

	return null;
};

function savePlaylist(file: PlaylistFile) : boolean {
	try {
		const fileData = {
			format: "md-playlist",
			version: 1,
			uuid: file.uuid,
			musics: file.musics
		};

		const fileStr = JSON.stringify(fileData);
		fs.writeFileSync(file.path, fileStr, { encoding: "utf-8", flag: 'w'});

		return true;
	} catch (ex: any) {
		console.error(ex);
	}

	return false;
};

export function executeSavePlaylist(ctx: MainContext, fallbackSaveAs: boolean = true) {
	if (!ctx.win) {
		return;
	}

	ctx.isSavingPlaylist = true;

	if (ctx.filePath) {
		const file = openPlaylist(ctx.filePath);

		if (!file) {
			if (fallbackSaveAs) {
				executeSaveAsPlaylist(ctx); // Save as (file cannot be opened)
			}
		} else {
			const playlistUUID = file.uuid;

			const saveFile = {
				path: ctx.filePath,
				uuid: playlistUUID,
				musics: ctx.musics
			} as PlaylistFile;
			
			if (savePlaylist(saveFile)) {
				ctx.isDirty = false;
				ctx.lastSavedHash = computePlaylistHash(ctx.musics);
				updateMainTitle(ctx);
			}
		}
	} else {
		if (fallbackSaveAs) {
			executeSaveAsPlaylist(ctx); // Save as (no opened file)
		}
	}

	ctx.isSavingPlaylist = false;
}

export function executeSaveAsPlaylist(ctx: MainContext) {
	if (!ctx.win) {
		return;
	}

	ctx.isSavingPlaylist = true;

	const savePath = dialog.showSaveDialogSync(ctx.win, {
		title: "Save Playlist",
		defaultPath: DEFAULT_FILE,
		filters: [
			{name: 'Playlist', extensions: ['mlist']}
		]
	});

	if(savePath){
		const file = openPlaylist(savePath);
		const playlistUUID = file ? file.uuid : crypto.randomUUID();

		const saveFile = {
			path: savePath,
			uuid: playlistUUID,
			musics: ctx.musics
		} as PlaylistFile;
		
		if (savePlaylist(saveFile)) {
			ctx.filePath = savePath;
			ctx.isDirty = false;
			ctx.lastSavedHash = computePlaylistHash(ctx.musics);
			updateMainTitle(ctx);
		}
	}

	ctx.isSavingPlaylist = false;
}

export function executeOpenPlaylist(ctx: MainContext) {
	if (!ctx.win) {
		return;
	}

	ctx.isOpeningPlaylist = true;

	const openPath = dialog.showOpenDialogSync(ctx.win, {
		title: "Open Playlist",
		defaultPath: DEFAULT_FOLDER,
		filters: [
			{name: 'Playlist', extensions: ['mlist']}
		]
	});

	if(openPath && openPath[0]){
		const file = openPlaylist(openPath[0]);

		if (file) {
			ctx.musics = file.musics;
			ctx.filePath = file.path;
			
			ctx.reactView?.webContents.send(
				IPC_CHANNELS.SYNC_RENDERER_MUSICS_EVENT, 
				ctx.musics
			);

			if (ctx.currMusic) {
				ctx.webView?.webContents.send(
					IPC_CHANNELS.SYNC_RENDERER_PRESENT_EVENT, 
					isMusicPresent(ctx.musics, ctx.currMusic)
				);
			}

			ctx.isDirty = false;
			ctx.lastSavedHash = computePlaylistHash(ctx.musics);
			updateMainTitle(ctx);
		}
	}

	ctx.isOpeningPlaylist = false;
}