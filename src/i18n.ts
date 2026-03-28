import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zhTW from './locales/zh-TW.json';

const resources = {
  en: { translation: en },
  'zh-TW': { translation: zhTW },
} as const;

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: 'zh-TW', // 預設語言為繁體中文
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React 已經防止 XSS
  },
});

export default i18n;
