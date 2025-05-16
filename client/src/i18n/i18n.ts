import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import jaTranslation from './ja.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja: {
        translation: jaTranslation
      }
    },
    lng: 'ja',
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
