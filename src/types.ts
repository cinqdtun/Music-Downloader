import type { BaseWindow, WebContentsView, BrowserWindow } from "electron";

export interface PlaylistFile {
	path: string;
	uuid: string;
	musics: Music[];
};

export interface Music {
	cover: string;
	title: string;
	artist: string;
	duration: string;
	id: string;
	platform: string;
};

export interface Config {
	lang: 'system' | 'en' | 'fr';
	adBlocker: boolean;
	autoSave: boolean;
	defaultLocation: string;
	embedTags: boolean;
	embedThumbnail: boolean;
	forceIpv4: boolean;
	output: "flat-out" | "artist-and-title-out" | "subfolders-out";
	format: "mp3" | "m4a" | "opus";
	downloadsArgs: string;
};

export interface SelectItemValues {
	label: string;
	value?: string;
	tag?: string;
};

export interface MainContext {
	win: BaseWindow | null;
	webView: WebContentsView | null;
	reactView: WebContentsView | null;
	loadingViewMain: WebContentsView | null;
	popupView: WebContentsView | null;
	lastForward: number;
	isDirty: boolean;
	lastSavedHash: string;
	isDownloading: boolean;
	isOpeningPlaylist: boolean;
	isSavingPlaylist: boolean;
	isQuitting: boolean;
	filePath: string | null;
	config: Config;
	musics: Music[];
	currMusic: Music | null;
};

export class YTDLPError extends Error {
	constructor(
		message: string,
		public readonly isPostProcessing: boolean,
		public readonly rawStderr: string,
		public readonly originalError?: any
	) {
		super(message);
		this.name = "YTDLPError";
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export type PopupType = 'none' | 'settings' | 'unsaved';

export interface Coords {
	x: number;
	y: number;
};

export type PlayerStates = {
	isAd: boolean;
	isPlayerActive: boolean;
};