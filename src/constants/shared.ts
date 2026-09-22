import { Config } from "@/types";

export const enum IPC_CHANNELS {
	SYNC_RENDERER_MUSICS_EVENT = "SYNC_RENDERER_MUSICS",
	ADD_MUSIC_EVENT = "ADD_MUSIC_EVENT",
	REMOVE_MUSIC_EVENT = "REMOVE_MUSIC_EVENT",
	CURR_MUSIC_PRESENT = "CURR_MUSIC_PRESENT",
	SYNC_RENDERER_PRESENT_EVENT = "SYNC_RENDERER_PRESENT_EVENT",
	SYNC_RENDERER_CONFIG_REQUEST = "SYNC_RENDERER_CONFIG_REQUEST",
	DOWNLOAD_FINISHED_EVENT = "DOWNLOAD_FINISHED_EVENT",
	DOWNLOAD_PROGRESS_EVENT = "DOWNLOAD_PROGRESS_EVENT",
	SYNC_MAIN_CONFIG_EVENT = "SYNC_MAIN_CONFIG_EVENT",
	BG_BLUR_EVENT = "BG_BLUR_EVENT",
	BG_UNBLUR_EVENT = "BG_UNBLUR_EVENT",
	TOAST_EVENT = "TOAST_EVENT",
	CHANGE_LANGUAGE_EVENT = "CHANGE_LANGUAGE_EVENT",
	// Actions
	SAVE_PLAYLIST_EVENT = "SAVE_PLAYLIST_EVENT",
	SAVE_AS_PLAYLIST_EVENT = "SAVE_AS_PLAYLIST_EVENT",
	OPEN_PLAYLIST_EVENT = "OPEN_PLAYLIST_EVENT",
	DOWNLOAD_PLAYLIST_EVENT = "DOWNLOAD_PLAYLIST_EVENT",
	NAVIGATE_MUSIC_EVENT = "NAVIGATE_MUSIC_EVENT",
	DEFAULT_FOLDER_CHANGE_EVENT = "DEFAULT_FOLDER_CHANGE_EVENT",
	DOWNLOAD_ABORT_EVENT = "DOWNLOAD_ABORT_EVENT",
	CLOSE_POPUP_EVENT = "CLOSE_POPUP_EVENT",
	SAVE_AND_QUIT_EVENT = "SAVE_AND_QUIT_EVENT",
	QUIT_EVENT = "QUIT_EVENT",
	OPEN_SETTINGS_EVENT = "OPEN_SETTINGS_EVENT",
	OPEN_UNSAVED_EVENT = "OPEN_UNSAVED_EVENT",
	// Loading
	LOAD_OPACITY_ANIMATION_REQ_EVENT = "LOAD_OPACITY_ANIMATION_REQ_EVENT",
	LOAD_OPACITY_ANIMATION_FINISHED_EVENT = "LOAD_OPACITY_ANIMATION_FINISHED_EVENT"
}

export const PLACEHOLDER_CONFIG: Config = {
	lang: 'system',
	adBlocker: true,
	autoSave: true,
	defaultLocation: "",
	embedTags: true,
	embedThumbnail: true,
	forceIpv4: false,
	output: "artist-and-title-out",
	format: "mp3",
	downloadsArgs: ""
};

export const SETTINGS_WIDTH = 600;
export const SETTINGS_HEIGHT = 500;

export const UNSAVED_WIDTH = 600;
export const UNSAVED_HEIGHT = 200;

export const ADD_BTN_ID = "ADD_BTN";
export const TOASTER_ROOT_COMPONENT = "TOASTER_ROOT";

export const PLAYER_SELECTOR = "#layout > ytmusic-player-bar";
export const PLAYER_STATE_SELECTOR = "#layout";
export const PLAYER_AD_SELECTOR = "ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > span > span";
export const PLAYER_THUMBNAIL_SELECTOR = "#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.thumbnail-image-wrapper.style-scope.ytmusic-player-bar > img";
export const PLAYER_TITLE_SELECTOR = "#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > yt-formatted-string";

export const PLAYER_ADD_BTN_PARENT_SELECTOR = "#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.middle-controls-buttons.style-scope.ytmusic-player-bar";

// Player reworking to display only usefull elements
export const PLAYER_LIKE_SELECTOR = "#like-button-renderer";
export const PLAYER_PLAYBACK_RATE_SELECTOR = "#right-controls > div > ytmusic-playback-rate-renderer";
export const PLAYER_REPEAT_SELECTOR = "#right-controls > div > yt-icon-button.repeat.style-scope.ytmusic-player-bar";
export const PLAYER_SHUFFLE_SELECTOR = "#right-controls > div > yt-icon-button.shuffle.style-scope.ytmusic-player-bar";
export const PLAYER_EXPAND_SELECTOR = "#right-controls > div > yt-icon-button.expand-button.style-scope.ytmusic-player-bar";
export const PLAYER_MINIFIED_CONTROLS_SELECTOR = "#expanding-menu";
export const PLAYER_MINIFIED_REPEAT_SELECTOR = "#expand-repeat";
export const PLAYER_MINIFIED_SHUFFLE_SELECTOR = "#expand-shuffle";
export const PLAYER_MINIFIED_VOLUME_SLIDER_SELECTOR = "#expand-volume-slider";
export const PLAYER_MINIFIED_VOLUME_SELECTOR = "#expand-volume";

export const PLAYER_ACTIVE_ATTRIBUTE = "player-ui-state" ;
export const PLAYER_AD_STATUS_ATTRIBUTE = "hidden";
export const PLAYER_THUMBNAIL_ATTRIBUTE = "src";

export const PLAYER_INACTIVE_ATTR_VALUE = "INACTIVE";

// Music details
export const PLAYER_DURATION_SELECTOR = "#left-controls > span";
export const PLAYER_DURATION_PLACEHOLDER = "0:00";