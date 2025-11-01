import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import bnTranslation from './locales/bn.json';
import taTranslation from './locales/ta.json';
import teTranslation from './locales/te.json';
import paTranslation from './locales/pa.json';
import mrTranslation from './locales/mr.json';
import haTranslation from './locales/ha.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
  bn: {
    translation: bnTranslation,
  },
  ta: {
    translation: taTranslation,
  },
  te: {
    translation: teTranslation,
  },
  pa: {
    translation: paTranslation,
  },
  mr: {
    translation: mrTranslation,
  },
  ha: {
    translation: haTranslation,
  },
};

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Language detection configuration
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    // Set default language to Hindi to match SIH requirement
    lng: localStorage.getItem('i18nextLng') || 'hi',

    // React options
    react: {
      useSuspense: false,
    },
  });

export default i18n;
