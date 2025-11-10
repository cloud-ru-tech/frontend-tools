import { Languages, LOCALSTORAGE_LANGUAGE_KEY } from './constants';

export function getCurrentLanguage() {
  const fromS = localStorage.getItem(LOCALSTORAGE_LANGUAGE_KEY) as Languages;

  return Languages.En.includes(fromS) ? Languages.En : Languages.Ru;
}
