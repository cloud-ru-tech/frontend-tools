import { format, Locale } from 'date-fns';
import { ru } from 'date-fns/locale';
import buildLocalizeFn from 'date-fns/locale/_lib/buildLocalizeFn';

const monthValues = {
  narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  abbreviated: ['янв', 'фев', 'марта', 'апр', 'мая', 'июня', 'июля', 'авг', 'сент', 'окт', 'нояб', 'дек'],
  wide: [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ],
};

const ruLocale = {
  ...ru,
  localize: {
    month: buildLocalizeFn({
      values: monthValues,
      defaultWidth: 'wide',
      formattingValues: monthValues,
      defaultFormattingWidth: 'wide',
    }),
  },
} as Locale;

enum DateFormatter {
  Date = 'DATE',
  Time = 'TIME',
  TimeNoSec = 'TIME_NO_SEC',
  DateTime = 'DATE_TIME',
  DateTimeNoSec = 'DATE_TIME_NO_SEC',
  DateShortMonthTimeNoSec = 'DATE_SHORT_MONTH_TIME_NO_SEC',
  DateTimeWithDashes = 'DATE_TIME_WITH_DASHES',
  DateShortMonthTime = 'DATE_SHORT_MONTH_TIME',
  DateMonthNoTime = 'DATE_WITH_MONTH_NO_TIME',
  DateShortMonth = 'DATE_SHORT_DAY_WITH_MONTH',
  DateShortMonthYear = 'DATE_SHORT_DAY_WITH_MONTH_YEAR',
}

const DATE_TIME_FORMAT = {
  [DateFormatter.Date]: 'dd.MM.yyyy',
  [DateFormatter.Time]: 'HH:mm:ss',
  [DateFormatter.TimeNoSec]: 'HH:mm',
  [DateFormatter.DateTime]: 'dd.MM.yyyy HH:mm:ss',
  [DateFormatter.DateTimeNoSec]: 'dd.MM.yyyy HH:mm',
  [DateFormatter.DateShortMonthTimeNoSec]: 'dd MMM yyyy, HH:mm',
  [DateFormatter.DateTimeWithDashes]: 'dd-MM-yyyy, HH:mm:ss',
  [DateFormatter.DateShortMonthTime]: 'dd MMM yyyy, HH:mm:ss',
  [DateFormatter.DateMonthNoTime]: 'dd MMMM yyyy',
  [DateFormatter.DateShortMonth]: 'dd MMM',
  [DateFormatter.DateShortMonthYear]: 'dd MMM yyyy',
};

export function formatDate<T>(value: T, pattern?: DateFormatter, locale?: Locale) {
  return (typeof value === 'string' && !isNaN(Date.parse(value))) || typeof value === 'number' || value instanceof Date
    ? format(new Date(value), (pattern && DATE_TIME_FORMAT[pattern]) || DATE_TIME_FORMAT.DATE_TIME_NO_SEC, {
        locale: locale?.code === 'ru' ? ruLocale : locale,
      })
    : '–';
}

formatDate.formatters = DateFormatter;
