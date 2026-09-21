import { MainContext } from "@/types";
import { app, BaseWindow, BrowserWindow, ipcMain, WebContents, WebContentsView } from "electron";
import { BOTTOM_BAR_WIDTH, ICON_PATH, INJECTOR_PATH, PRELOAD_PATH } from "./constants/main";
import path from "path";
import { IPC_CHANNELS } from "./constants/shared";

function updateLayoutFull(ctx: MainContext) {
	if (!ctx.win || !ctx.webView) return;

	const [width, height] = ctx.win.getContentSize();

	ctx.webView.setBounds({
		x: 0,
		y: 0,
		width: width,
		height: height
	});
};

function updateLayout(ctx: MainContext) {
	if (!ctx.win) return;

	const [width, height] = ctx.win.getContentSize();
	const webViewWidth = Math.max(0, width - BOTTOM_BAR_WIDTH);

	// Website takes the top section
	ctx.webView?.setBounds({
		x: BOTTOM_BAR_WIDTH,
		y: 0,
		width: webViewWidth,
		height: height
	});

	// React UI takes the bottom section
	ctx.reactView?.setBounds({
		x: 0,
		y: 0,
		width: BOTTOM_BAR_WIDTH,
		height: height
	});

	// Popup view
	ctx.popupView?.setBounds({
		x: 0,
		y: 0,
		width: width,
		height: height
	});

	// Loading view
	ctx.loadingViewMain?.setBounds({
		x: 0,
		y: 0,
		width: width,
		height: height
	});
};

function updateLayoutFullWhenReady(ctx: MainContext) {
    let lastBounds = JSON.stringify(ctx.win?.getContentBounds());

    const check = () => {
        const current = JSON.stringify(ctx.win?.getContentBounds());
        if (current === lastBounds) {
            updateLayoutFull(ctx);
        } else {
            lastBounds = current;
            setTimeout(check, 30);
        }
    };

    setTimeout(check, 30);
}

function updateLayoutWhenReady(ctx: MainContext) {
    let lastBounds = JSON.stringify(ctx.win?.getContentBounds());

    const check = () => {
        const current = JSON.stringify(ctx.win?.getContentBounds());
        if (current === lastBounds) {
            updateLayout(ctx);
        } else {
            lastBounds = current;
            setTimeout(check, 30);
        }
    };

    setTimeout(check, 30);
}

function loadView(view: WebContentsView | BrowserWindow, url: string) : Promise<void> {
	return new Promise((resolve, reject) => {
		view.webContents.once('did-finish-load', () => {
			resolve();
		});

		view.webContents.once('did-fail-load', (_event, errorCode, errorDescription) => {
			reject(new Error(`Failed to load ${url}: ${errorDescription} (${errorCode})`));
		});

		if (url.toLowerCase().startsWith("http")) {
			view.webContents.loadURL(url);
		} else {
			view.webContents.loadFile(url);
		}
  	});
}

export async function initializeViews(ctx: MainContext) {
	if (!ctx.webView || !ctx.reactView || !ctx.loadingViewMain || !ctx.popupView) {
		return;
	}

	const reactViewUrl = process.env['ELECTRON_RENDERER_URL'] ? 
		`${process.env['ELECTRON_RENDERER_URL']}/assets/index.html` : 
		path.join(__dirname, '../renderer/assets/index.html');

	const screenLoaderUrl = process.env['ELECTRON_RENDERER_URL'] ? 
		`${process.env['ELECTRON_RENDERER_URL']}/assets/loading.html` : 
		path.join(__dirname, '../renderer/assets/loading.html');

	const popupUrl = process.env['ELECTRON_RENDERER_URL'] ? 
		`${process.env['ELECTRON_RENDERER_URL']}/assets/popup.html` : 
		path.join(__dirname, '../renderer/assets/popup.html');
	
	const webViewUrl = 'https://music.youtube.com';
	
	ipcMain.once(
		IPC_CHANNELS.LOAD_OPACITY_ANIMATION_FINISHED_EVENT, 
		() => {
			if (ctx.loadingViewMain) {
				ctx.win?.contentView.removeChildView(ctx.loadingViewMain);

				if (!ctx.loadingViewMain.webContents.isDestroyed()) {
					ctx.loadingViewMain.webContents.close();
				}

				ctx.loadingViewMain = null;
			}
		}
	);

	await loadView(ctx.loadingViewMain, screenLoaderUrl);

	console.log('Loading screen is ready !');

	ctx.win?.show();

	await Promise.all([
		loadView(ctx.webView, webViewUrl),
		loadView(ctx.reactView, reactViewUrl),
		loadView(ctx.popupView, popupUrl),
	]);

	console.log('Views have finished loading!');
	
	ctx.loadingViewMain?.webContents.send(IPC_CHANNELS.LOAD_OPACITY_ANIMATION_REQ_EVENT);
}

export function createMainWindow(ctx: MainContext) {
	ctx.win = new BaseWindow({ 
		width: 1000, 
		height: 620,
		minWidth: 1000,
		minHeight: 600,
		autoHideMenuBar: true,
		title: "Music Downloader",
		icon: ICON_PATH,
		show: false
	});

	updateMainTitle(ctx);

	ctx.webView = new WebContentsView({		
		webPreferences: {
			preload: INJECTOR_PATH,
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	ctx.reactView = new WebContentsView({
		webPreferences: {
			preload: PRELOAD_PATH,
			contextIsolation: true,
			nodeIntegration: false
		}
	});

	ctx.popupView = new WebContentsView({
		webPreferences: {
			preload: PRELOAD_PATH,
			contextIsolation: true,
			nodeIntegration: false
		}
	});

	ctx.loadingViewMain = new WebContentsView({
		webPreferences: {
			preload: PRELOAD_PATH,
			contextIsolation: true,
			nodeIntegration: false
		}
	});
	
	ctx.win.contentView.addChildView(ctx.webView);
	ctx.win.contentView.addChildView(ctx.reactView);
	ctx.win.contentView.addChildView(ctx.popupView);
	ctx.win.contentView.addChildView(ctx.loadingViewMain);

	ctx.popupView?.setVisible(false);

	ctx.popupView.setBackgroundColor('#00000000');
	ctx.loadingViewMain.setBackgroundColor('#00000000');
	
	updateLayout(ctx);

	ctx.win.on('resize', () => { updateLayoutWhenReady(ctx) });
	ctx.win.on('maximize', () => { updateLayoutWhenReady(ctx) });
	ctx.win.on('unmaximize', () => { updateLayoutWhenReady(ctx) });
	ctx.win.on('enter-full-screen', () => { updateLayoutWhenReady(ctx) });
	ctx.win.on('leave-full-screen', () => { updateLayoutWhenReady(ctx) });

	ctx.webView.webContents.setWindowOpenHandler(({ url }) => {
		return { action: 'deny' };
	});

	// Request close and close all webviews
	ctx.win.on('close', (event) => {
		if (!ctx.isQuitting && ctx.isDirty) {
			event.preventDefault();

			showPopupLayer(ctx);
			ctx.popupView?.webContents.send(IPC_CHANNELS.OPEN_UNSAVED_EVENT);
			return;
		}

		ctx.isQuitting = true;

		if (ctx.webView && !ctx.webView?.webContents.isDestroyed()) {
			ctx.win?.contentView.removeChildView(ctx.webView);
			ctx.webView?.webContents.close();
			ctx.webView = null;
		}

		if (ctx.reactView && !ctx.reactView?.webContents.isDestroyed()) {
			ctx.win?.contentView.removeChildView(ctx.reactView);
			ctx.reactView?.webContents.close();
			ctx.reactView = null;
		}

		if (ctx.popupView && !ctx.popupView?.webContents.isDestroyed()) {
			ctx.win?.contentView.removeChildView(ctx.popupView);
			ctx.popupView?.webContents.close();
			ctx.popupView = null;
		}

		if (ctx.loadingViewMain && !ctx.loadingViewMain?.webContents.isDestroyed()) {
			ctx.win?.contentView.removeChildView(ctx.loadingViewMain);
			ctx.loadingViewMain?.webContents.close();
			ctx.loadingViewMain = null;
		}

		ctx.win?.destroy();
		ctx.win = null;
	});
};

export function showPopupLayer(ctx: MainContext) {
	ctx.webView?.webContents.send(IPC_CHANNELS.BG_BLUR_EVENT);
	ctx.reactView?.webContents.send(IPC_CHANNELS.BG_BLUR_EVENT);

	ctx.popupView?.setVisible(true);
}

export function hidePopupLayer(ctx: MainContext) {
	ctx.popupView?.setVisible(false);

	ctx.webView?.webContents.send(IPC_CHANNELS.BG_UNBLUR_EVENT);
	ctx.reactView?.webContents.send(IPC_CHANNELS.BG_UNBLUR_EVENT);
}

export function updateMainTitle(ctx: MainContext) {
	if (!ctx.win) {
		return;
	}

	ctx.win.setTitle(`Music Downloader | ${ctx.filePath ? ctx.filePath : "untitled"}${ctx.isDirty ? "*" : ""}`);
}