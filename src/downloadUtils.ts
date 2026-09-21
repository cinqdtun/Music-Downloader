import { ChildProcess, execFile } from "child_process"
import { sleep } from "./utils"

import { MainContext, Music, YTDLPError } from '@/types'
import { sanitizeMetadata } from "@/utils"
import { dialog, ipcMain } from "electron";
import { isFolderWritable } from "./fileUtils";
import { getDownloadArgs } from "./argsUtils";
import { 
	DEFAULT_FOLDER, 
	DONLOAD_TIMEOUT, 
	MAX_DOWNLOAD_ATTEMPTS, 
	RETRY_TIMEOUT, 
	YTDLP_PATH } from "./constants/main";
import { IPC_CHANNELS } from "./constants/shared";

function downloadMusic(music: Music, args: string[]) : Promise<void> {
	return new Promise((resolve, reject) => {
		let child: ChildProcess | null = null;
		let url = "";

		const handleAbort = () => {
			child?.kill();
			console.warn("[Download] Abort invoked. Sent SIGKILL.");
			return;
		};

		if (music.platform === "youtube") {
			url = `https://music.youtube.com/watch?v=${music.id}`;
		}

		const santizedTitle = sanitizeMetadata(music.title);
		const santizedArtist = sanitizeMetadata(music.artist);



		const metadata = [
			"--parse-metadata", ` ${santizedTitle}: (?P<title>.+)`,
			"--parse-metadata", ` ${santizedArtist}: (?P<artist>.+)`
		];

		const fullArgs = [
			url,
			...metadata,
			...args
		];

		child = execFile(YTDLP_PATH, fullArgs, (err, stdout, stderr) => {
			console.log(`[STDOUT] ${stdout}`);
			console.error(`[STDERR] ${stderr}`);

			if (err) {
				const isPostProcessing = /ERROR:\s*Postprocessing:/i.test(stderr);

				ipcMain.removeListener(
					IPC_CHANNELS.DOWNLOAD_ABORT_EVENT, 
					handleAbort
				);

				return reject(
					new YTDLPError(
						err.message,
						isPostProcessing,
						stderr,
						err
					)
				);
			}

			ipcMain.removeListener(
				IPC_CHANNELS.DOWNLOAD_ABORT_EVENT, 
				handleAbort
			);
			resolve();
		});

		ipcMain.once(
			IPC_CHANNELS.DOWNLOAD_ABORT_EVENT, 
			handleAbort
		);
	});
}

function stopDownload(ctx: MainContext) {
	ctx.isDownloading = false;
	ctx.reactView?.webContents.send(IPC_CHANNELS.DOWNLOAD_FINISHED_EVENT);
}

function sendDownloadProgress(downloaded: number, ctx: MainContext) {
	ctx.reactView?.webContents.send(
		IPC_CHANNELS.DOWNLOAD_PROGRESS_EVENT, 
		downloaded / ctx.musics.length * 100
	);
}

export async function executeDownload(ctx: MainContext) {
	if (!ctx.win) {
		stopDownload(ctx);
		return;
	}

	let downloadPath = ctx.config.defaultLocation;

	if (!isFolderWritable(downloadPath)) {
		// prompt user to choose another path
		const folderPath = dialog.showOpenDialogSync(ctx.win, {
			title: "Choose Folder",
			defaultPath: DEFAULT_FOLDER,
			properties: ['openDirectory']
		});

		if (!folderPath || !folderPath[0] || !isFolderWritable(folderPath[0])) {
			stopDownload(ctx);
			return;
		}
		
		downloadPath = folderPath[0];
	}

	const args = getDownloadArgs(ctx.config);
	let downloaded = 0;
	let abort = false;

	ipcMain.once(IPC_CHANNELS.DOWNLOAD_ABORT_EVENT, _event => {
		abort = true;
	});

	for (const music of ctx.musics) {
		let attempts = 0;

		if (abort) {
			console.warn("[Download] Abort invoked.");
			break;
		}

		while (attempts < MAX_DOWNLOAD_ATTEMPTS) {
			try {
				await downloadMusic(music, args);
				downloaded++;
				sendDownloadProgress(downloaded, ctx);
				break;
			} catch (err: any) {
				if (abort) {
					break;
				}

				attempts++;
				console.warn(`[Download] Attempt ${attempts} failed: ${err.message}`)

				if (err instanceof YTDLPError) {
					const e = err as YTDLPError;

					if (e.isPostProcessing) {
						ctx.webView?.webContents.send(IPC_CHANNELS.TOAST_EVENT, "toasts.postprocessfailed", "warning");
						console.log("[Download] Post processing error. Skipping track.");
						downloaded++;
						sendDownloadProgress(downloaded, ctx);
						break;
					}
				}

				if (attempts >= MAX_DOWNLOAD_ATTEMPTS) {
					ctx.webView?.webContents.send(IPC_CHANNELS.TOAST_EVENT, "toasts.downloadfailed", "error");
					console.error("[Download] All download attempts exhausted.");
					stopDownload(ctx);
					return;
				}

				sleep(RETRY_TIMEOUT);
			}
		}

		sleep(DONLOAD_TIMEOUT);
	}

	if (!abort) {
		ctx.webView?.webContents.send(IPC_CHANNELS.TOAST_EVENT, "toasts.downloadsuccess", "success");
	}
	
	stopDownload(ctx);
}