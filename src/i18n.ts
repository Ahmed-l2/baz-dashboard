// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import ar from '../locales/ar.json';

// Get stored language from localStorage or default to 'ar'
const storedLanguage = localStorage.getItem('i18nextLng') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: storedLanguage,  // Use stored language
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Save language to localStorage whenever it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
