import {app } from 'electron'
import { MainContext } from '@/types'
import { openConfig } from '@/configUtils'

import { getEnableAdBlockerFunc, hookAdBlockerInjector } from './adBlocker'
import { createMainWindow, initializeViews } from './windowUtils'
import { initIpc } from './ipcUtils'
import { computePlaylistHash } from './utils'
import { injectCookies } from './cookiesUtils'

let ctx: MainContext = {
	win: null,
	webView: null,
	reactView: null,
	loadingViewMain: null,
	popupView: null,

	lastForward: 0,

	isDirty: false,
	lastSavedHash: computePlaylistHash([]),
	isDownloading: false,
	isOpeningPlaylist: false,
	isSavingPlaylist: false,
	isQuitting: false,
	filePath: null,

	config: openConfig(),
	musics: [],
	currMusic: null
};

function hookAdBlockEnabler() {
	if (ctx.webView) {
		const enableAdBlockFunc = getEnableAdBlockerFunc();

		ctx.webView.webContents.on('dom-ready', () => {
			if (ctx.config.adBlocker) {
				ctx.webView?.webContents.executeJavaScript(enableAdBlockFunc);
			}
		});
	}
}

// Append lang at launch
if (ctx.config.lang && ctx.config.lang !== 'system') {
	app.commandLine.appendSwitch('lang', ctx.config.lang);
}

app.whenReady().then(async () => {
	console.log('System locale:', app.getSystemLocale());

	

	// Create windows
	createMainWindow(ctx);

	// Wake up IPC
	initIpc(ctx);

	// Inject cookies
	await injectCookies();

	// Inject AD Blocker hooks
	if (ctx.webView) {
		hookAdBlockerInjector(ctx.webView);
	}
	hookAdBlockEnabler();

	initializeViews(ctx);
});

app.on('before-quit', () => {
	ctx.isQuitting = true;
});