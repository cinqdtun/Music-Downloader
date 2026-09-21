import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { Music, Config, PopupType } from '@/types'
import { IPC_CHANNELS } from '@/constants/shared'

export type Unsubscribe = () => void;

export interface ElectronAPI {
	// Actions
	navigateMusic: (link: string) => void;
	sendRemoveMusic: (music: Music) => void;
	savePlaylist: () => void;
	saveAsPlaylist: () => void;
	openPlaylist: () => void;
	downloadPlaylist: () => void;
	defaultFolderChange: () => Promise<string | null>;
	abortDownload: () => void;
	closePopup: () => void;
	saveAndQuit: () => void;
	quit: () => void;
	openSettings: () => void;
	openUnsaved: () => void;
	// Sync / events
	onSyncRendererMusics: (callback: (musics: Music[]) => void) => Unsubscribe;
	onDownloadFinished: (callback: () => void) => Unsubscribe;
	onDownloadProgress: (callback: (donwloaded: number) => void) => Unsubscribe;
	syncMainConfig: (cfg: Config) => void;
	syncRendererConfigRequest: () => Promise<Config>;
	onBgBlur: (callback: () => void) => Unsubscribe;
	onBgUnblur: (callback: () => void) => Unsubscribe;
	onLanguageChange: (callback: (lang: string) => void) => Unsubscribe;
	onOpenSettings: (callback: (cfg: Config) => void) => Unsubscribe;
	onOpenUnsaved: (callback: () => void) => Unsubscribe;
	// Loading screen
	onLoadOpacityAnimationReq: (callback: () => void) => Unsubscribe;
	loadOpacityAnimationFinished: () => void;
}

const api: ElectronAPI = {
	// Actions
	navigateMusic: (link: string): void => {
		ipcRenderer.send(IPC_CHANNELS.NAVIGATE_MUSIC_EVENT, link);
	},
	sendRemoveMusic: (music: Music) : void => {
		ipcRenderer.send(
			IPC_CHANNELS.REMOVE_MUSIC_EVENT, 
			music
		);
	},
	savePlaylist: (): void => {
		ipcRenderer.send(IPC_CHANNELS.SAVE_PLAYLIST_EVENT);
	},
	saveAsPlaylist: (): void => {
		ipcRenderer.send(IPC_CHANNELS.SAVE_AS_PLAYLIST_EVENT);
	},
	openPlaylist: (): void => {
		ipcRenderer.send(IPC_CHANNELS.OPEN_PLAYLIST_EVENT);
	},
	downloadPlaylist: () : void => {
		ipcRenderer.send(IPC_CHANNELS.DOWNLOAD_PLAYLIST_EVENT);
	},
	defaultFolderChange: async () : Promise<string | null> => {
		return await ipcRenderer.invoke(IPC_CHANNELS.DEFAULT_FOLDER_CHANGE_EVENT) as string | null;
	},
	abortDownload: (): void => {
		ipcRenderer.send(IPC_CHANNELS.DOWNLOAD_ABORT_EVENT);
	},
	closePopup: () : void =>  {
		ipcRenderer.send(IPC_CHANNELS.CLOSE_POPUP_EVENT);
	},
	saveAndQuit: () : void => {
		ipcRenderer.send(IPC_CHANNELS.SAVE_AND_QUIT_EVENT);
	},
	quit: () : void => {
		ipcRenderer.send(IPC_CHANNELS.QUIT_EVENT);
	},
	openSettings: () : void => {
		ipcRenderer.send(IPC_CHANNELS.OPEN_SETTINGS_EVENT);
	},
	openUnsaved: () : void => {
		ipcRenderer.send(IPC_CHANNELS.OPEN_UNSAVED_EVENT);
	},
	onSyncRendererMusics: (callback: (musics: Music[]) => void) : Unsubscribe => {
		const sub = (_event: IpcRendererEvent, musics: Music[]) =>  {
			callback(musics);
		};

		ipcRenderer.on(
			IPC_CHANNELS.SYNC_RENDERER_MUSICS_EVENT, 
			sub
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.SYNC_RENDERER_MUSICS_EVENT, 
				sub
			);
		};
	},
	onDownloadFinished: (callback: () => void): Unsubscribe => {
		const subscription = (_event: IpcRendererEvent) =>  {
			callback();
		};

		ipcRenderer.on(
			IPC_CHANNELS.DOWNLOAD_FINISHED_EVENT, 
			subscription
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.DOWNLOAD_FINISHED_EVENT, 
				subscription
			);
		};
	},
	onDownloadProgress: (callback: (progress: number) => void): Unsubscribe =>  {
		const subscription = (_event: IpcRendererEvent, progress: number) =>  {
			callback(progress);
		};

		ipcRenderer.on(
			IPC_CHANNELS.DOWNLOAD_PROGRESS_EVENT, 
			subscription
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.DOWNLOAD_PROGRESS_EVENT, 
				subscription
			);
		};
	},
	syncMainConfig: (cfg: Config): void => {
		ipcRenderer.send(
			IPC_CHANNELS.SYNC_MAIN_CONFIG_EVENT, 
			cfg
		);
	},
	syncRendererConfigRequest: async (): Promise<Config> => {
		return await ipcRenderer.invoke(IPC_CHANNELS.SYNC_RENDERER_CONFIG_REQUEST) as Config;
	},
	onBgBlur: (callback: () => void) : Unsubscribe => {
		const subscription = (_event: IpcRendererEvent) =>  {
			callback();
		};

		ipcRenderer.on(
			IPC_CHANNELS.BG_BLUR_EVENT, 
			subscription
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.BG_BLUR_EVENT, 
				subscription
			);
		};
	},
	onBgUnblur: (callback: () => void) : Unsubscribe => {
		const subscription = (_event: IpcRendererEvent) =>  {
			callback();
		};

		ipcRenderer.on(
			IPC_CHANNELS.BG_UNBLUR_EVENT, 
			subscription
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.BG_UNBLUR_EVENT, 
				subscription
			);
		};
	},
	onLanguageChange: (callback: (lang: string) => void) : Unsubscribe => {
		const subscription = (_event: IpcRendererEvent, lang: string) =>  {
			callback(lang);
		};

		ipcRenderer.on(
			IPC_CHANNELS.CHANGE_LANGUAGE_EVENT, 
			subscription
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.CHANGE_LANGUAGE_EVENT, 
				subscription
			);
		};
	},
	onOpenSettings: (callback: (cfg: Config) => void) : Unsubscribe => {
		const subscription = (_event: IpcRendererEvent, cfg: Config) =>  {
			callback(cfg);
		};

		ipcRenderer.on(
			IPC_CHANNELS.OPEN_SETTINGS_EVENT, 
			subscription
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.OPEN_SETTINGS_EVENT, 
				subscription
			);
		};
	},
	onOpenUnsaved: (callback: () => void) : Unsubscribe => {
		const subscription = (_event: IpcRendererEvent) =>  {
			callback();
		};

		ipcRenderer.on(
			IPC_CHANNELS.OPEN_UNSAVED_EVENT, 
			subscription
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.OPEN_UNSAVED_EVENT, 
				subscription
			);
		};
	},
	// Loading screen
	onLoadOpacityAnimationReq: (callback: () => void) : Unsubscribe => {
		const subscription = (_event: IpcRendererEvent) =>  {
			callback();
		};

		ipcRenderer.once(
			IPC_CHANNELS.LOAD_OPACITY_ANIMATION_REQ_EVENT, 
			subscription
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.LOAD_OPACITY_ANIMATION_REQ_EVENT, 
				subscription
			);
		};
	},
	loadOpacityAnimationFinished: () : void => {
		ipcRenderer.send(IPC_CHANNELS.LOAD_OPACITY_ANIMATION_FINISHED_EVENT);
	}
};

contextBridge.exposeInMainWorld('electronAPI', api);