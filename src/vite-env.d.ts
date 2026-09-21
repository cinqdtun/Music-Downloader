/// <reference types="vite/client" />

import { ElectronAPI } from '@/preload/preload';

declare global {
	interface Window {
		electronAPI: ElectronAPI;
	}

	const __FFMPEG_PATH__: string;
	const __JS_RUNTIME_PATH__: string;
	const __YTDLP_PATH__: string;
	const __IS_DEV__: boolean;
}

export {};