import React from 'react'
import ReactDOM from 'react-dom/client'
import PopupView from '@/views/PopupView'
import '@/styles/styles.css'

import '@/i18n'
import '@fontsource-variable/geist'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<PopupView />
	</React.StrictMode>
);