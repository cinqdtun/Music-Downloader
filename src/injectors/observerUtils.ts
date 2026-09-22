type WatcherCallbacks = {
	onAddedCallbacks: ((el: HTMLElement) => void)[];
	onRemovedCallbacks: ((el: HTMLElement) => void)[];
};

type WatcherAttributesCallback = (element: Element, mutations: MutationRecord[], observer: MutationObserver) => void;

export function watchElement(selector: string, { onAddedCallbacks, onRemovedCallbacks }: WatcherCallbacks) {
	let activeElement: HTMLElement | null = null;

	const check = () => {
		const matchingElement = document.querySelector<HTMLElement>(selector);

		if (activeElement && !matchingElement) {
			for (const callback of onRemovedCallbacks) {
				callback(activeElement);
			}

			activeElement = null;
		}

		if (!activeElement && matchingElement) {
			activeElement = matchingElement;

			for (const callback of onAddedCallbacks) {
				callback(matchingElement);
			}
		}
	};

	check();

	const observer = new MutationObserver(check);
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});

	return () => observer.disconnect();
};

export function watchElementAttributes(selector: string, callback: WatcherAttributesCallback, attributesFilter?: string[], args?: any) {
	const element = document.querySelector(selector);
	if (!element) {
		return;
	}

	const observer = 
		new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => { callback(element, mutations, observer); });
	
	observer.observe(element, {
		childList: true,
		attributeFilter: attributesFilter,
		subtree: true,
		...args
	});

	callback(element, [], observer);

	return () => observer.disconnect();
};