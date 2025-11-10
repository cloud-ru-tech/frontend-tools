import LanguageDetector, { CustomDetector } from 'i18next-browser-languagedetector';

export const CUSTOM_NAVIGATOR_DETECTOR_NAME = 'navigator-detector';

const CUSTOM_NAVIGATOR_DETECTOR: CustomDetector = {
  name: CUSTOM_NAVIGATOR_DETECTOR_NAME,
  lookup() {
    if (typeof navigator === 'undefined') {
      return undefined;
    }

    const browserLanguages = navigator.languages || [navigator.language];
    for (const code of browserLanguages) {
      if (code.toLowerCase().startsWith('ru')) return 'ru-RU';
      if (code.toLowerCase().startsWith('en')) return 'en-GB';
    }
    // fallbackLng
    return undefined;
  },
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(CUSTOM_NAVIGATOR_DETECTOR);

export { languageDetector };
