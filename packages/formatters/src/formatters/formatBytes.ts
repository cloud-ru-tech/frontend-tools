export enum Lang {
  Ru = 'ru-Ru',
  En = 'en-GB',
}

function getSizesTranslations(lang?: Lang) {
  switch (lang) {
    case Lang.En:
      return ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    case Lang.Ru:
    default:
      return ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ', 'ЭБ', 'ЗБ', 'ИБ'];
  }
}

export function formatBytes(value: number, lang?: Lang): string {
  const sizes = getSizesTranslations(lang);

  if (value === 0) return `0 ${sizes[0]}`;

  const decimals = 2;

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;

  const i = Math.floor(Math.log(value) / Math.log(k));

  return `${parseFloat((value / k ** i).toFixed(dm))} ${sizes[i]}`;
}

formatBytes.languages = Lang;
