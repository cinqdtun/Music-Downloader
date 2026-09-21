import { app, dialog, ipcMain } from "electron";
import { getDisableAdBlockerFunc, getEnableAdBlockerFunc } from "./adBlocker";
import { MainContext, Music, Config, PopupType } from "./types";
import { DEFAULT_FOLDER, FORWARD_CD } from "./constants/main";
import { addMusic, isMusicPresent, removeMusic } from "./musicUtils";
import { IPC_CHANNELS } from "./constants/shared";
import { executeOpenPlaylist, executeSaveAsPlaylist, executeSavePlaylist } from "./playlistUtils";
import { hidePopupLayer, showPopupLayer, updateMainTitle } from "./windowUtils";
import { executeDownload } from "./downloadUtils";
import { isFolderWritable } from "./fileUtils";
import { writeConfig } from "./configUtils";
import { computePlaylistHash } from "./utils";

function onMusicUpdate(ctx: MainContext) {
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

	const currentPlaylistHash: string = computePlaylistHash(ctx.musics);
	ctx.isDirty = ctx.lastSavedHash !== currentPlaylistHash;

	// If auto save enabled
	if (ctx.config.autoSave && ctx.filePath) {
		executeSavePlaylist(ctx, false);
	}

	updateMainTitle(ctx);
}

export function initIpc(ctx: MainContext) {
	// Navigate to music url
	ipcMain.on(
		IPC_CHANNELS.NAVIGATE_MUSIC_EVENT,
		(_event, link : string) => {
			//if (Date.now() - ctx.lastForward < FORWARD_CD) {
			//	return;
			//}

			const rawUrl = ctx.webView?.webContents.getURL();

			if (!rawUrl) {
				return;
			}

			const currUrl = new URL(rawUrl);
			const newUrl = new URL(link);

			if (currUrl.hostname === "music.youtube.com") {
				const currId = currUrl.searchParams.get('v');
				const videoId = newUrl.searchParams.get('v');

				if (currId === videoId) {
					return;
				}

				ctx.webView?.webContents.executeJavaScript(`
					document.dispatchEvent(new CustomEvent('yt-navigate', {
						bubbles: true,
          				composed: true,
						detail: {
							endpoint: {
								watchEndpoint: {
									videoId: '${videoId}',
									playlistId: 'RDAMVM${videoId}',
									params: 'wAEB'
								}
							}
						}
					}));
				`);
			} else {
				ctx.webView?.webContents.loadURL(link);
			}

			ctx.lastForward = Date.now();
		}
	);

	// Add music from webview
	ipcMain.on(
		IPC_CHANNELS.ADD_MUSIC_EVENT, 
		(_event, music: Music) => {
			if (ctx.isDownloading || ctx.isSavingPlaylist || ctx.isOpeningPlaylist) {
				return;
			}

			const updatedMusics = addMusic(ctx.musics, music);
			if (!updatedMusics) {
				return;
			}

			ctx.musics = updatedMusics;

			onMusicUpdate(ctx);
		}
	);

	// On removed from webview
	ipcMain.on(
		IPC_CHANNELS.REMOVE_MUSIC_EVENT, 
		(_event, music: Music) => {
			if (ctx.isDownloading || ctx.isSavingPlaylist || ctx.isOpeningPlaylist) {
				return;
			}

			ctx.musics = removeMusic(ctx.musics, music);
			onMusicUpdate(ctx);
		}
	);

	// When curr music change. Ask if music is present or not
	ipcMain.handle(
		IPC_CHANNELS.CURR_MUSIC_PRESENT, 
		(_event, music: Music) : Boolean => {
			ctx.currMusic = music;

			return isMusicPresent(ctx.musics, music);
		}
	);

	ipcMain.on(
		IPC_CHANNELS.OPEN_UNSAVED_EVENT, 
		(_event) => {
			showPopupLayer(ctx);
			ctx.popupView?.webContents.send(IPC_CHANNELS.OPEN_UNSAVED_EVENT);
		}
	);

	ipcMain.on(IPC_CHANNELS.OPEN_SETTINGS_EVENT, 
		(_event) => {
			showPopupLayer(ctx);
			ctx.popupView?.webContents.send(IPC_CHANNELS.OPEN_SETTINGS_EVENT, ctx.config);
		}
	);

	ipcMain.on(
		IPC_CHANNELS.SAVE_PLAYLIST_EVENT, 
		(_event) => {
			if (ctx.isSavingPlaylist) {
				return;
			}

			executeSavePlaylist(ctx);
		}
	);
	
	ipcMain.on(
		IPC_CHANNELS.SAVE_AS_PLAYLIST_EVENT, 
		(_event) => {
			if (ctx.isSavingPlaylist) {
				return;
			}

			executeSaveAsPlaylist(ctx);
		}
	);

	ipcMain.on(
		IPC_CHANNELS.OPEN_PLAYLIST_EVENT, 
		(_event) => {
			if (ctx.isDownloading || ctx.isOpeningPlaylist) {
				return;
			}

			executeOpenPlaylist(ctx);
		}
	);

	ipcMain.on(
		IPC_CHANNELS.DOWNLOAD_PLAYLIST_EVENT, 
		(_event) => {
			if (ctx.isDownloading) {
				return;
			}
			
			ctx.isDownloading = true;
			executeDownload(ctx);
	});

	// Prompt use to select a DEFAULT folder for downloads
	ipcMain.handle(
		IPC_CHANNELS.DEFAULT_FOLDER_CHANGE_EVENT, 
		(_event) : string | null => {
			if (!ctx.win) {
				return null;
			}

			const folderPath = dialog.showOpenDialogSync(ctx.win, {
				title: "Choose Folder",
				defaultPath: DEFAULT_FOLDER,
				properties: ['openDirectory']
			});

			if (!folderPath || !folderPath[0] || !isFolderWritable(folderPath[0])) {
				return null;
			}

			return folderPath[0];
		}
	);

	ipcMain.on(
		IPC_CHANNELS.CLOSE_POPUP_EVENT,
		(_event) => {
			hidePopupLayer(ctx);
		}
	);

	ipcMain.on(
		IPC_CHANNELS.SAVE_AND_QUIT_EVENT,
		(_event) => {
			executeSavePlaylist(ctx, true);

			if (!ctx.isDirty) {
				app.quit();
			}
		}
	);

	ipcMain.on(
		IPC_CHANNELS.QUIT_EVENT,
		(_event) => {
			app.quit();
		}
	);

	ipcMain.on(
		IPC_CHANNELS.SYNC_MAIN_CONFIG_EVENT, 
		(_event, cfg: Config) => {
			if (writeConfig(cfg)) {
				if (cfg.adBlocker !== ctx.config.adBlocker) {
					ctx.webView?.webContents.executeJavaScript(cfg.adBlocker ? 
						getEnableAdBlockerFunc() : 
						getDisableAdBlockerFunc());
				}

				if (cfg.autoSave !== ctx.config.autoSave) {
					if (ctx.isDirty && ctx.filePath) {
						executeSavePlaylist(ctx, false);
					}
				}

				if (cfg.lang !== ctx.config.lang) {
					let lang: string = cfg.lang;

					if (cfg.lang === "system") {
						lang = app.getSystemLocale().split('-')[0];
					}

					ctx.webView?.webContents.send(IPC_CHANNELS.CHANGE_LANGUAGE_EVENT, lang);
					ctx.reactView?.webContents.send(IPC_CHANNELS.CHANGE_LANGUAGE_EVENT, lang);
					ctx.popupView?.webContents.send(IPC_CHANNELS.CHANGE_LANGUAGE_EVENT, lang);
				}

				ctx.config = cfg;
			}
		}
	);

	ipcMain.handle(
		IPC_CHANNELS.SYNC_RENDERER_CONFIG_REQUEST, 
		(): Config => ctx.config
	);
}