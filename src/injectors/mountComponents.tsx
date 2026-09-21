import React from 'react'
import { 
	createRoot, 
	Root } from 'react-dom/client'
import styles from '@/styles/webviewStyles.css?inline'

export function mountReactComponent(component: React.ReactNode, parent: Element, id: string) {
	const hostDiv = document.createElement('div');
	hostDiv.id = `${id}-react-host`;

	parent.appendChild(hostDiv);

	const shadowRoot = hostDiv.attachShadow({ mode: 'open' });

	const componentSheet = new CSSStyleSheet();
	const scopedStyles = styles.replaceAll(':root', ':host');
	
  	componentSheet.replaceSync(scopedStyles);
	shadowRoot.adoptedStyleSheets = [componentSheet];

	const reactContainer = document.createElement('div');
	shadowRoot.appendChild(reactContainer);

	const reactRoot = createRoot(reactContainer);

	reactRoot.render(component);

	(hostDiv as any)._reactRoot  = reactRoot;
}

export function unmountReactComponent(id: string) {
	const reactHost = document.getElementById(`${id}-react-host`);

	if (reactHost) {
		((reactHost as any)._reactRoot as Root)?.unmount();
		reactHost.remove();
	}
}

export function remountReactComponent(component: React.ReactNode, parent: Element, id: string) {
	unmountReactComponent(id);
	mountReactComponent(component, parent, id);
}