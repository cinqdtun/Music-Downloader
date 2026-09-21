import { WebContentsView } from 'electron'

function injectAdBlockerPayload() {
	if ((window as any).__adBlockerInit) return;
	(window as any).__adBlockerInit = true;

	(window as any).__nativeFetch = (window as any).__nativeFetch || window.fetch;
	(window as any).__adBlockerPatch = async function (...args: any) {
		const request = args[0];

		let url : string = "";
		if (typeof request === 'string') {
			url = request;
		} else if (request instanceof URL) {
			url = request.href;
		} else {
			url = request.url;
		}

		const isTargetEndpoint =
			url &&
			url.includes('music.youtube.com') &&
			url.includes('/youtubei/v1/player');

		// Abort because it is not a target endpoint
		if (!isTargetEndpoint) {
			return (window as any).__nativeFetch.apply(this, args);
		}

		// Fetch response
		const response = await (window as any).__nativeFetch.apply(this, args);

		try {
			const data = await response.clone().json();

			// Stripping ads fields
			delete data.playerAds;
			delete data.adPlacements;
			delete data.adSlots;

			if (data.playerConfig?.daiConfig) {
				delete data.playerConfig.daiConfig;
			}

			return new Response(JSON.stringify(data), {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers
			});
		} catch (ex) {
			console.error('[ad-blocker] failed to parse/modify response, returning original:', ex);
			return response;
		}
	};
}

function enableAdBlocker() {
	window.fetch = (window as any).__adBlockerPatch;
}

function disableAdBlocker() {
	window.fetch = (window as any).__nativeFetch;
}

export function hookAdBlockerInjector(webView: WebContentsView) {
	const compiledAdBlocker = `(${injectAdBlockerPayload.toString()})();`;
	
	webView.webContents.on('dom-ready', () => {
		webView?.webContents.executeJavaScript(compiledAdBlocker);
	});
}

export function getEnableAdBlockerFunc() {
	return (`(${enableAdBlocker.toString()})();`);
}

export function getDisableAdBlockerFunc() {
	return (`(${disableAdBlocker.toString()})();`);
}
