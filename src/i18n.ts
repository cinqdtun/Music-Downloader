import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const locale = navigator.language.split('-')[0];

const resources = {
  en: { translation: enTranslations },
  fr: { translation: frTranslations }
};

i18n
	.use(initReactI18next)
	.init({
		resources,
		lng: locale,
		fallbackLng: 'en',
		supportedLngs: ['en', 'fr'],
  		load: 'languageOnly',
		nonExplicitSupportedLngs: true
	});

export default i18n;