import { app } from "electron"
import { resolveBinaryPath } from "@/utils"
import path from "path"

export const RETRY_TIMEOUT = 5000;
export const DONLOAD_TIMEOUT = 2000;
export const MAX_DOWNLOAD_ATTEMPTS = 5;

export const YTDLP_PATH = resolveBinaryPath(__YTDLP_PATH__);
export const FFMPEG_PATH = resolveBinaryPath(__FFMPEG_PATH__);
export const JS_RUNTIME_PATH = resolveBinaryPath(__JS_RUNTIME_PATH__);

export const DEFAULT_FILE = path.join(app.getPath('documents'), 'untitled.mlist');
export const DEFAULT_FOLDER = app.getPath('documents');

export const BOTTOM_BAR_WIDTH = 350;
export const FORWARD_CD = 2000;

export const INJECTOR_PATH = path.join(__dirname, "../preload/injector.js");
export const PRELOAD_PATH = path.join(__dirname, '../preload/preload.js');

export const ICON_PATH = path.join(__dirname, '../../assets/icons/1024x1024.png');

export const CONSENT_COOKIE_NAME = "SOCS";
export const CONSENT_COOKIE_VALUE = "CAESNQgREitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjYwOTA2LjA1X3AwGgJlbiACGgYIgOfB1QY";
export const CONSENT_COOKIE_URL = "https://music.youtube.com";
export const CONSENT_COOKIE_DOMAIN = ".youtube.com";