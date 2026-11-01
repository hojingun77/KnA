import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.js';
import en from './locales/en.js';
import vi from './locales/vi.js';
import zh from './locales/zh-CN.js';
import { ui } from './ui.js';

export function normalizeLanguage(language) {
  const prefix = (language ?? '').toLowerCase().split('-')[0];
  return { ko: 'ko', en: 'en', vi: 'vi', zh: 'zh-CN' }[prefix] ?? 'en';
}

export const deviceLanguage = normalizeLanguage(typeof navigator === 'undefined' ? 'en' : navigator.language);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: { ...ko, ui: ui.ko } },
      en: { translation: { ...en, ui: ui.en } },
      vi: { translation: { ...vi, ui: ui.vi } },
      'zh-CN': { translation: { ...zh, ui: ui['zh-CN'] } },
    },
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React는 XSS 자체 처리
    },
  });

export default i18n;
