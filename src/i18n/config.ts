import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import el from './el';

const LANGUAGE_KEY = 'app_language';

// Get saved language or default to English
const savedLanguage = typeof window !== 'undefined' 
  ? localStorage.getItem(LANGUAGE_KEY) || 'en' 
  : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      el,
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem(LANGUAGE_KEY, lng);
};

export const getCurrentLanguage = () => i18n.language;

export default i18n;
