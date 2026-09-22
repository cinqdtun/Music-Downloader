import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { downloadBinaries } from "./scripts/downloadBinaries.mjs"

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Plug TTY functions for CI
for (const stream of [process.stdout, process.stderr]) {
	if (stream && typeof stream.clearLine !== 'function') {
		stream.clearLine = () => false;
	}

	if (stream && typeof stream.cursorTo !== 'function') {
		stream.cursorTo = () => false;
	}

	if (stream && typeof stream.moveCursor !== 'function') {
		stream.moveCursor  = () => false;
	}
}

function dependenciesDownloaderPlugin(platform, arch) {
	let executed = false;

	return {
		name: "vite-plugin-dependencies-downloader",
		async configResolved() {

			if (executed) return;
			executed = true;

			try {
				await downloadBinaries(platform, arch, __dirname);
			} catch (error) {
				console.error("Failed to download dependencies:", error);
				throw error;
			}
		},
	};
}

export default defineConfig(({ command, mode }) => {
	const isDev = command === "serve";
	const targetPlatform = process.env.TARGET_PLATFORM || process.platform;
	const targetArch = process.env.TARGET_ARCH || process.arch;
	const devTools = process.env.DEVTOOLS !== undefined ? process.env.DEVTOOLS === 'true' : isDev;

	const ext = targetPlatform === "win32" ? ".exe" : "";
	const devExt = `-${targetPlatform}-${targetArch}${ext}`;

	return {
		main: {
			root: resolve(__dirname),
			resolve: {
				alias: {
					'@': resolve(__dirname, 'src')
				}
			},
			define: {
				__FFMPEG_PATH__: JSON.stringify(`bin/ffmpeg${devExt}`),
				__JS_RUNTIME_PATH__: JSON.stringify(`bin/qjs${devExt}`),
				__YTDLP_PATH__: JSON.stringify(`bin/yt-dlp${devExt}`),
				__IS_DEV__: isDev,
				__DEVTOOLS__: devTools
			},
			plugins: [
				dependenciesDownloaderPlugin(targetPlatform, targetArch)
			],
			build: {
				outDir: 'dist/main',
				lib: {
					entry: [
						resolve(__dirname, 'src/main.ts')
					]
				}
			}
		},
		preload: {
			root: resolve(__dirname),
			resolve: {
				alias: {
					'@': resolve(__dirname, 'src')
				}
			},
			plugins: [
				react(),
				tailwindcss()
			],
			build: {
				outDir: 'dist/preload',
				rollupOptions: {
					input: {
						preload: resolve(__dirname, 'src/preload/preload.ts'),
						injector: resolve(__dirname, 'src/injectors/injector.tsx')
					},
					output: {
						format: "cjs",
						inlineDynamicImports: false
					}
				},
				isolatedEntries: true,
      			  externalizeDeps: false
			}
		},
		renderer: {
			root: resolve(__dirname),
			resolve: {
				alias: {
					'@': resolve(__dirname, 'src')
				}
			},
			plugins: [
				react(),
				tailwindcss()
			],
			build: {
				outDir: 'dist/renderer',
				rollupOptions: {
					input: {
						index: resolve(__dirname, 'assets/index.html'),
						popup: resolve(__dirname, 'assets/popup.html'),
						loading: resolve(__dirname, 'assets/loading.html')
					}
				}
			}
		}
	}
});