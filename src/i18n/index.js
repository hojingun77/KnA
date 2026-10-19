import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.js';
import en from './locales/en.js';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    lng: 'ko',          // 기본 언어 (로그인 후 계정의 languageCode로 교체)
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false, // React는 XSS 자체 처리
    },
  });

export default i18n;
