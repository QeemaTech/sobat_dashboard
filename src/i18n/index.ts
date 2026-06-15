import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

const STORAGE_KEY = 'sobat_lang';

export function getStoredLanguage(): 'ar' | 'en' {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function applyDocumentLanguage(lang: 'ar' | 'en') {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  document.body.dir = dir;
}

const initialLang = getStoredLanguage();
applyDocumentLanguage(initialLang);

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: false,
  supportedLngs: ['ar', 'en'],
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  const lang = lng === 'en' ? 'en' : 'ar';
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  applyDocumentLanguage(lang);
});

export default i18n;
