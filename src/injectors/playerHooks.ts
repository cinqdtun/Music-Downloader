import { 
	PLAYER_ACTIVE_ATTRIBUTE, 
	PLAYER_AD_SELECTOR, 
	PLAYER_AD_STATUS_ATTRIBUTE, 
	PLAYER_INACTIVE_ATTR_VALUE, 
	PLAYER_SELECTOR, 
	PLAYER_STATE_SELECTOR, 
	PLAYER_THUMBNAIL_ATTRIBUTE, 
	PLAYER_THUMBNAIL_SELECTOR } from '@/constants/shared'
import { 
	watchElement, 
	watchElementAttributes } from './observerUtils'
import { PlayerStates } from '@/types'

type InitPlayerHooksProps = {
	onPlayerStatesChange?: (states: PlayerStates) => void,
	onMusicChange?: (states: PlayerStates) => void,
	onPlayerAdded?: (el: Element) => void;
	onPlayerRemoved?: (el: Element) => void;
}

let playerAttObservers: (() => void)[] = [];

let _playerStates: PlayerStates = {
	isAd: false,
	isPlayerActive: false
};

let _hooks: InitPlayerHooksProps = {
	onPlayerStatesChange: undefined,
	onMusicChange: undefined,
	onPlayerAdded: undefined,
	onPlayerRemoved: undefined
}

export function initPlayerHooks({
	onPlayerStatesChange,
	onMusicChange,
	onPlayerAdded,
	onPlayerRemoved
} : InitPlayerHooksProps) {
	_hooks.onPlayerStatesChange = onPlayerStatesChange;
	_hooks.onMusicChange = onMusicChange;
	_hooks.onPlayerAdded = onPlayerAdded;
	_hooks.onPlayerRemoved = onPlayerRemoved;

	playerWatcher();
}

function playerWatcher() {
	watchElement(PLAYER_STATE_SELECTOR, {
		onAddedCallbacks: [onPlayerAdded],
		onRemovedCallbacks: [onPlayerRemoved]
	});
}

function onPlayerAdded() {
	const playerComponent: HTMLElement | null = document.querySelector(PLAYER_SELECTOR);

	if (!playerComponent) {
		return;
	}

	console.log("[INFO] Player added!");

	let observer = watchElementAttributes(PLAYER_STATE_SELECTOR, (element: Element) => {
		const prevValue = _playerStates.isPlayerActive;
		const value = element.getAttribute(PLAYER_ACTIVE_ATTRIBUTE);

		_playerStates.isPlayerActive = !(value === PLAYER_INACTIVE_ATTR_VALUE);
		if (_hooks.onPlayerStatesChange && prevValue !== _playerStates.isPlayerActive) { _hooks.onPlayerStatesChange(_playerStates); }
	}, [PLAYER_ACTIVE_ATTRIBUTE]);

	if (observer) { playerAttObservers.push(observer); }

	observer = watchElementAttributes(PLAYER_AD_SELECTOR, (element: Element) => {
		const prevValue = _playerStates.isAd ;
		const value = element.hasAttribute(PLAYER_AD_STATUS_ATTRIBUTE);

		_playerStates.isAd = !value;
		if (_hooks.onPlayerStatesChange && prevValue !== _playerStates.isAd) { _hooks.onPlayerStatesChange(_playerStates); }
	}, [PLAYER_AD_STATUS_ATTRIBUTE]);

	if (observer) { playerAttObservers.push(observer); }

	observer = watchElementAttributes(PLAYER_THUMBNAIL_SELECTOR, () => {
		if (_hooks.onMusicChange) { _hooks.onMusicChange(_playerStates); }
	}, [PLAYER_THUMBNAIL_ATTRIBUTE]);

	if (observer) { playerAttObservers.push(observer); }

	if (_hooks.onPlayerAdded) { _hooks.onPlayerAdded(playerComponent); }
}

function onPlayerRemoved(el: Element) {
	for (const playerAttObserver of playerAttObservers) {
		playerAttObserver();
	}

	playerAttObservers = [];

	if (_hooks.onPlayerRemoved) { _hooks.onPlayerRemoved(el); }
}