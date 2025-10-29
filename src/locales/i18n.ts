import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation.json';
import vi from './vi/translation.json';

const languageKey = 'language';
const saved = typeof window !== 'undefined' ? localStorage.getItem(languageKey) : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: saved || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLanguage(lang: 'en' | 'vi') {
  i18n.changeLanguage(lang);
  localStorage.setItem(languageKey, lang);
}

export default i18n;

