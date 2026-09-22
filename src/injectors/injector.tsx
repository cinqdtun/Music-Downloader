import React from 'react'
import { 
	ipcRenderer, 
	IpcRendererEvent } from 'electron'
import { 
	Music, 
	PlayerStates } from '@/types'
import { 
	ADD_BTN_ID, 
	IPC_CHANNELS, 
	PLAYER_ADD_BTN_PARENT_SELECTOR, 
	PLAYER_EXPAND_SELECTOR, 
	PLAYER_LIKE_SELECTOR, 
	PLAYER_MINIFIED_CONTROLS_SELECTOR, 
	PLAYER_MINIFIED_REPEAT_SELECTOR, 
	PLAYER_MINIFIED_SHUFFLE_SELECTOR, 
	PLAYER_MINIFIED_VOLUME_SELECTOR, 
	PLAYER_MINIFIED_VOLUME_SLIDER_SELECTOR, 
	PLAYER_PLAYBACK_RATE_SELECTOR, 
	PLAYER_REPEAT_SELECTOR, 
	PLAYER_SELECTOR, 
	PLAYER_SHUFFLE_SELECTOR, 
	PLAYER_TITLE_SELECTOR, 
	TOASTER_ROOT_COMPONENT } from '@/constants/shared'
import { 
	toast, 
	Toaster } from '@/components/toast'
import { AddButton } from '@/components/addButton'
import { 
	mountReactComponent, 
	remountReactComponent, 
	unmountReactComponent } from './mountComponents'
import { initPlayerHooks } from './playerHooks'
import { getMusic } from './musicUtils'
import { ToastListener } from '@/components/toastListener'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'

let deleteMode: boolean = true;
let currentMusic: Music | null = null;

function renderAddBtn() {
	const parent = document.querySelector(PLAYER_ADD_BTN_PARENT_SELECTOR);

	if (parent) {
		remountReactComponent(<AddButton type={deleteMode ? 'delete' : 'add'} onClick={onYoutubeBtn}/>, parent, ADD_BTN_ID);
	}
}

function mountToasterRoot() {
	const toasterParent = document.querySelector("body");

	if (toasterParent) {
		console.log("[INFO] Toaster is mounted !");
		mountReactComponent(<Toaster/>, toasterParent, TOASTER_ROOT_COMPONENT);
	}
}

function onYoutubeBtn(event: React.MouseEvent<HTMLButtonElement>) {
	event.stopPropagation();

	if (!currentMusic) {
		return;
	}

	if (deleteMode) {
		ipcRenderer.send(
			IPC_CHANNELS.REMOVE_MUSIC_EVENT, 
			currentMusic
		);
	} else {
		deleteMode = true;
		renderAddBtn();

		ipcRenderer.send(
			IPC_CHANNELS.ADD_MUSIC_EVENT, 
			currentMusic
		);
	}
}

function onPlayerStatesChange(states: PlayerStates) {
	console.log(states);
}

function onMusicChange(states: PlayerStates) {
	const title = document.querySelector(PLAYER_TITLE_SELECTOR)?.textContent;

	if (states.isPlayerActive && !states.isAd && title && title.trim().length > 0) {
		// New music
		const interval = setInterval(async () => {
			const music = await getMusic();

			if (!music || music === currentMusic) {
				return;
			}

			clearInterval(interval);

			deleteMode = await ipcRenderer.invoke(
				IPC_CHANNELS.CURR_MUSIC_PRESENT, 
				music
			);

			currentMusic = music;
			renderAddBtn();
		}, 100);
	} else {
		unmountReactComponent(ADD_BTN_ID);
	}
}

function onPlayerAdded(element: Element) {
	const likeComponent: HTMLElement | null = document.querySelector(PLAYER_LIKE_SELECTOR);

	if (likeComponent) {
		likeComponent.style.display = 'none';
	}

	const playbackRateComponent: HTMLElement | null = document.querySelector(PLAYER_PLAYBACK_RATE_SELECTOR);

	if (playbackRateComponent) {
		playbackRateComponent.style.display = 'none';
	}

	const repeatComponent: HTMLElement | null = document.querySelector(PLAYER_REPEAT_SELECTOR);

	if (repeatComponent) {
		repeatComponent.style.display = 'none';
	}

	const shuffleComponent: HTMLElement | null = document.querySelector(PLAYER_SHUFFLE_SELECTOR);

	if (shuffleComponent) {
		shuffleComponent.style.display = 'none';
	}

	const expandComponent: HTMLElement | null = document.querySelector(PLAYER_EXPAND_SELECTOR);

	if (expandComponent) {
		expandComponent.style.display = 'none';
	}

	const minifiedControlsComponent: HTMLElement | null = document.querySelector(PLAYER_MINIFIED_CONTROLS_SELECTOR);

	if (minifiedControlsComponent) {
		minifiedControlsComponent.style.removeProperty('display');
		minifiedControlsComponent.style.zIndex = '103'; // Magic value present in original code
		minifiedControlsComponent.style.opacity = '1';
	}

	const minifiedRepeatComponent: HTMLElement | null = document.querySelector(PLAYER_MINIFIED_REPEAT_SELECTOR);

	if (minifiedRepeatComponent) {
		minifiedRepeatComponent.style.display = 'none';
	}

	const minifiedShuffleComponent: HTMLElement | null = document.querySelector(PLAYER_MINIFIED_SHUFFLE_SELECTOR);

	if (minifiedShuffleComponent) {
		minifiedShuffleComponent.style.display = 'none';
	}

	const minifiedVolumeSliderComponent: HTMLElement | null = document.querySelector(PLAYER_MINIFIED_VOLUME_SLIDER_SELECTOR);
	
	if (minifiedVolumeSliderComponent) {
		minifiedVolumeSliderComponent.style.display = 'none';
		minifiedVolumeSliderComponent.style.pointerEvents = 'auto';
	}
	
	const minifiedVolumeComponent: HTMLElement | null = document.querySelector(PLAYER_MINIFIED_VOLUME_SELECTOR);
	(element as HTMLElement).onmouseleave = () => {
		if (minifiedVolumeSliderComponent) {
			minifiedVolumeSliderComponent.style.display = 'none';
		}
	};

	if (minifiedVolumeComponent) {
		minifiedVolumeComponent.style.pointerEvents = 'auto';

		minifiedVolumeComponent.onmouseenter = () => {
			if (minifiedVolumeSliderComponent) {
				minifiedVolumeSliderComponent.style.removeProperty('display');
			}
		};
	}
}

window.addEventListener("DOMContentLoaded", () => {
	initPlayerHooks({ 
		onPlayerStatesChange, 
		onMusicChange,
		onPlayerAdded
	});

	mountToasterRoot();

	const onPresent = (_event: IpcRendererEvent, isPresent: boolean) =>  {
		deleteMode = isPresent;

		renderAddBtn();
	};

	const onBlur = (_event: IpcRendererEvent) => {
		const html = document.querySelector("html");

		let overlay = document.getElementById('yt-blur-overlay');
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.id = 'yt-blur-overlay';
			overlay.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100vw;
				height: 100vh;
				backdrop-filter: blur(8px);
				-webkit-backdrop-filter: blur(8px);
				background: transparent;
				z-index: 2147483647;
				pointer-events: none;
			`;
			document.body.appendChild(overlay);
		}

    	overlay.style.display = 'block';

		if (html) {
			html.style.scrollbarWidth = 'none';
		}
	};

	const onUnblur = (_event: IpcRendererEvent) => {
		const html = document.querySelector("html");
		const overlay = document.getElementById('yt-blur-overlay');

		if (html) {
			html.style.removeProperty('scrollbar-width');
		}

		if (overlay) {
      		overlay.style.display = 'none';
   	 	}
	};

	ipcRenderer.on(
		IPC_CHANNELS.SYNC_RENDERER_PRESENT_EVENT, 
		onPresent
	);

	ipcRenderer.on(
		IPC_CHANNELS.BG_BLUR_EVENT, 
		onBlur
	);

	ipcRenderer.on(
		IPC_CHANNELS.BG_UNBLUR_EVENT, 
		onUnblur
	);

	const body = document.querySelector("body");

	if (body) {
		mountReactComponent(<I18nextProvider i18n={i18n}><ToastListener/></I18nextProvider>, body, "toast-listener");
	}
});