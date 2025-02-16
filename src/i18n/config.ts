
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import elTranslations from './locales/el.json';

const storedLanguage = localStorage.getItem('language_preference') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslations,
      el: elTranslations,
    },
    lng: storedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
