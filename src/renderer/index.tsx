import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/views/MainView'
import '@/styles/styles.css'

import '@/i18n'
import '@fontsource-variable/geist'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);