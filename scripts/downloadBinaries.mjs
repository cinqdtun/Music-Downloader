import { execFileSync } from 'node:child_process'
import path from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'

let binDir = "";
let tmpDir = "";

const FFMPEG_DOWNLOAD_PATH = "https://github.com/BtbN/FFmpeg-Builds/releases/latest/download";
const FFMPEG_WINDOWS_X86_64 = "win64";
const FFMPEG_WINDOWS_ARM64 = "winarm64";
const FFMPEG_LINUX_X86_64 = "linux64";
const FFMPEG_LINUX_ARM64 = "linuxarm64";

const FFMPEG_LINUX_ARCHIVE_PATTERN = "*/bin/ffmpeg";
const FFMPEG_WINDOWS_ARCHIVE_PATTERN = "bin/ffmpeg.exe";

const YTDLP_DOWNLOAD_PATH = "https://github.com/yt-dlp/yt-dlp/releases/latest/download";

const YTDLP_WINDOWS_X86_64 = "yt-dlp.exe";
const YTDLP_WINDOWS_ARM64 = "yt-dlp_arm64.exe";
const YTDLP_LINUX_X86_64 = "yt-dlp_linux";
const YTDLP_LINUX_ARM64 = "yt-dlp_linux_aarch64";

const QJS_DOWNLOAD_PATH = "https://github.com/quickjs-ng/quickjs/releases/latest/download";

const QJS_WINDOWS = "qjs-windows-x86_64.exe";
const QJS_LINUX_X86_64 = "qjs-linux-x86_64";
const QJS_LINUX_ARM64 = "qjs-linux-aarch64";

function getFFMPEGLink(platform, arch) {
	const isWin = platform === "win32";
	const isX64 = arch === "x64";

	if (isWin) {
		return isX64 ? 
			`${FFMPEG_DOWNLOAD_PATH}/ffmpeg-master-latest-${FFMPEG_WINDOWS_X86_64}-gpl.zip` :
			`${FFMPEG_DOWNLOAD_PATH}/ffmpeg-master-latest-${FFMPEG_WINDOWS_ARM64}-gpl.zip`;
	} else {
		return isX64 ? 
				`${FFMPEG_DOWNLOAD_PATH}/ffmpeg-master-latest-${FFMPEG_LINUX_X86_64}-gpl.tar.xz` :
				`${FFMPEG_DOWNLOAD_PATH}/ffmpeg-master-latest-${FFMPEG_LINUX_ARM64}-gpl.tar.xz`;
	}
}

function getYTDLPLink(platform, arch) {
	const isWin = platform === "win32";
	const isX64 = arch === "x64";

	if (isWin) {
		return isX64 ? 
			`${YTDLP_DOWNLOAD_PATH}/${YTDLP_WINDOWS_X86_64}` :
			`${YTDLP_DOWNLOAD_PATH}/${YTDLP_WINDOWS_ARM64}`;
	} else {
		return isX64 ? 
				`${YTDLP_DOWNLOAD_PATH}/${YTDLP_LINUX_X86_64}` :
				`${YTDLP_DOWNLOAD_PATH}/${YTDLP_LINUX_ARM64}`;
	}
}

function getQJSLink(platform, arch) {
	const isWin = platform === "win32";
	const isX64 = arch === "x64";

	if (isWin) {
		return `${QJS_DOWNLOAD_PATH}/${QJS_WINDOWS}`;
	} else {
		return isX64 ? 
				`${QJS_DOWNLOAD_PATH}/${QJS_LINUX_X86_64}` :
				`${QJS_DOWNLOAD_PATH}/${QJS_LINUX_ARM64}`;
	}
}

function extractFFMPEG(pathArchive, destFolder) {
	const lowerArchive = pathArchive.toLowerCase();

	if (lowerArchive.endsWith('.zip')) {
		const archive = new AdmZip(pathArchive);
		const entries = archive.getEntries();
		const entry = entries.find(e => e.entryName.endsWith(FFMPEG_WINDOWS_ARCHIVE_PATTERN));

		const destPath = path.join(destFolder, 'ffmpeg.exe');
		fs.writeFileSync(destPath, entry.getData());

		return;
	} else if (lowerArchive.endsWith('.tar.xz')) {
		const depth = FFMPEG_LINUX_ARCHIVE_PATTERN.split('/').length - 1;

		execFileSync('tar', [
			'-xvJf', pathArchive,
			'-C', destFolder,
			'--strip-components', String(depth),
			'--wildcards',
			'--no-anchored',
			FFMPEG_LINUX_ARCHIVE_PATTERN
		], {
			encoding: 'utf-8'
		});

		return;
	}

	throw new Error(`Unknown archive format: ${pathArchive}`);
}

async function downloadFFMPEGBinary(platform, arch) {
	const binaryExt = platform === "win32" ? ".exe" : "";
	const renamedFile = path.join(binDir, `ffmpeg-${platform}-${arch}${binaryExt}`);

	if (fs.existsSync(renamedFile)) {
		console.log(`FFMPEG binary is already present. Skipping download.`);
		return;
	}

	const url = getFFMPEGLink(platform, arch);
	const archiveExt = platform === "win32" ? ".zip" : ".tar.xz";
	const archivePath = path.join(tmpDir, `ffmpeg-${platform}-${arch}${archiveExt}`);

	console.log(`Downloading FFMPEG at ${url}...`);

	await downloadFile(url, archivePath);

	console.log(`Successfully downloaded FFMPEG archive in ${archivePath}.`);
	console.log(`Extracting FFMPEG archive...`);

	extractFFMPEG(archivePath, binDir);

	const extractedFile = path.join(binDir, `ffmpeg${binaryExt}`);

	if (fs.existsSync(extractedFile)) {
		fs.renameSync(extractedFile, renamedFile);
	}

	console.log(`Successfully extracted FFMPEG archive in ${renamedFile}`);

	if (platform == "linux") {
		fs.chmodSync(renamedFile, 0o755);
		console.log("Added read and execution permission on FFMPEG binary.");
	}
}

async function downloadYTDLPBinary(platform, arch) {
	const binaryExt = platform === "win32" ? ".exe" : "";
	const binaryPath = path.join(binDir, `yt-dlp-${platform}-${arch}${binaryExt}`);

	if (fs.existsSync(binaryPath)) {
		console.log(`YTDLP binary is already present. Skipping download.`);
		return;
	}

	const url = getYTDLPLink(platform, arch);

	console.log(`Downloading YTDLP at ${url}...`);

	await downloadFile(url, binaryPath);

	console.log(`Successfully downloaded YTDLP binary in ${binaryPath}.`);

	if (platform == "linux") {
		fs.chmodSync(binaryPath, 0o755);
		console.log("Added read and execution permission on YTDLP binary.");
	}
}

async function downloadQJSPBinary(platform, arch) {
	const binaryExt = platform === "win32" ? ".exe" : "";
	const binaryPath = path.join(binDir, `qjs-${platform}-${arch}${binaryExt}`);

	if (fs.existsSync(binaryPath)) {
		console.log(`QJS binary is already present. Skipping download.`);
		return;
	}

	const url = getQJSLink(platform, arch);

	console.log(`Downloading QJS at ${url}...`);

	await downloadFile(url, binaryPath);

	console.log(`Successfully downloaded QJS binary in ${binaryPath}.`);

	if (platform == "linux") {
		fs.chmodSync(binaryPath, 0o755);
		console.log("Added read and execution permission on QJS binary.");
	}
}

async function downloadFile(url, destPath, onProgress) {
	const response = await fetch(url, {
    	redirect: "follow",
		headers: {
			"User-Agent": "dependencies-resolver",
			"Accept": "*/*"
		},
	});
	if (!response.ok) {
		throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
	}

	const total = Number(response.headers.get('content-length')) || 0;
	let downloaded = 0;

	const fStream = fs.createWriteStream(destPath);
	const reader = response.body.getReader();

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		downloaded += value.length;
		fStream.write(value);
		if (onProgress) onProgress(downloaded, total);
	}

	await new Promise((resolve, reject) => {
		fStream.end(err => (err ? reject(err) : resolve()));
	});
}

export async function downloadBinaries(platform, arch, currdir) {
	binDir = path.join(currdir, "bin");
	tmpDir = path.join(currdir, "tmp");

	if (!fs.existsSync(binDir)) {
		fs.mkdirSync(binDir, { recursive: true });
	}

	if (!fs.existsSync(tmpDir)) {
		fs.mkdirSync(tmpDir, { recursive: true });
	}

	await downloadFFMPEGBinary(platform, arch);
	await downloadYTDLPBinary(platform, arch);
	await downloadQJSPBinary(platform, arch);

	if (fs.existsSync(tmpDir)) {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}

	console.log("Binaries downloaded successfully!");
}

async function main() {
	if (process.argv.length < 4) {
		console.error("Bad arguments.");
		console.error("Usage: js-interpreter downloadBinaries.mjs [PLATFORM] [ARCH]");
		process.exit(1);
	}
	
	const platform = process.argv[2].toLowerCase();
	const arch = process.argv[3].toLowerCase();

	if ((!(platform === "win32" || platform === "linux")) || (!(arch === "x64" || arch === "arm64"))) {
		console.error("Bad arguments.");
		console.error("Usage: js-interpreter downloadBinaries.mjs [PLATFORM] [ARCH]");
		process.exit(1);
	}

	const currdir = path.resolve(process.cwd());

	await downloadBinaries(platform, arch, currdir);
}

const isDirectRun =
	process.argv[1] &&
	path.basename(process.argv[1]).startsWith("downloadBinaries");

if (isDirectRun) {
	main().catch((err) => {
		console.error("Binaries download failed:", err);
		process.exit(1);
	});
}