import { ru } from 'date-fns/locale';

import { formatDate } from '../src';

const DATE_INPUT = '2023-01-20T11:15:00';
const NOT_DATE_STRING_INPUT = 'not-date';

const DATE_OUTPUT = '20.01.2023';
const DATE_TIME_OUTPUT = '20.01.2023 11:15:00';
const DATE_TIME_NO_SEC_OUTPUT = '20.01.2023 11:15';
const DATE_SHORT_MONTH_TIME_NO_SEC_OUTPUT = '20 Jan 2023, 11:15';
const RU_DATE_SHORT_MONTH_TIME_NO_SEC_OUTPUT = '20 янв 2023, 11:15';
const TIME_OUTPUT = '11:15:00';
const EMPTY_OUTPUT = '–';

describe('@sbercloud/ft-formatters/formatDate', () => {
  [
    { input: { value: new Date(DATE_INPUT), pattern: formatDate.formatters.Date }, output: DATE_OUTPUT },
    { input: { value: new Date(DATE_INPUT).toDateString(), pattern: formatDate.formatters.Date }, output: DATE_OUTPUT },
    { input: { value: new Date(DATE_INPUT).getTime(), pattern: formatDate.formatters.Date }, output: DATE_OUTPUT },
    { input: { value: DATE_INPUT, pattern: formatDate.formatters.Date }, output: DATE_OUTPUT },
    { input: { value: new Date(DATE_INPUT), pattern: formatDate.formatters.DateTime }, output: DATE_TIME_OUTPUT },
    {
      input: { value: new Date(DATE_INPUT).toUTCString(), pattern: formatDate.formatters.DateTime },
      output: DATE_TIME_OUTPUT,
    },
    {
      input: { value: new Date(DATE_INPUT).getTime(), pattern: formatDate.formatters.DateTime },
      output: DATE_TIME_OUTPUT,
    },
    { input: { value: DATE_INPUT, pattern: formatDate.formatters.DateTime }, output: DATE_TIME_OUTPUT },
    {
      input: { value: new Date(DATE_INPUT), pattern: formatDate.formatters.DateTimeNoSec },
      output: DATE_TIME_NO_SEC_OUTPUT,
    },
    {
      input: { value: new Date(DATE_INPUT).toUTCString(), pattern: formatDate.formatters.DateTimeNoSec },
      output: DATE_TIME_NO_SEC_OUTPUT,
    },
    {
      input: { value: new Date(DATE_INPUT).getTime(), pattern: formatDate.formatters.DateTimeNoSec },
      output: DATE_TIME_NO_SEC_OUTPUT,
    },
    { input: { value: DATE_INPUT, pattern: formatDate.formatters.DateTimeNoSec }, output: DATE_TIME_NO_SEC_OUTPUT },
    { input: { value: new Date(DATE_INPUT), pattern: formatDate.formatters.Time }, output: TIME_OUTPUT },
    {
      input: { value: new Date(DATE_INPUT).toUTCString(), pattern: formatDate.formatters.Time },
      output: TIME_OUTPUT,
    },
    { input: { value: new Date(DATE_INPUT).getTime(), pattern: formatDate.formatters.Time }, output: TIME_OUTPUT },

    {
      input: { value: new Date(DATE_INPUT), pattern: formatDate.formatters.DateShortMonthTimeNoSec },
      output: DATE_SHORT_MONTH_TIME_NO_SEC_OUTPUT,
    },
    {
      input: { value: new Date(DATE_INPUT), pattern: formatDate.formatters.DateShortMonthTimeNoSec, locale: ru },
      output: RU_DATE_SHORT_MONTH_TIME_NO_SEC_OUTPUT,
    },

    { input: { value: NOT_DATE_STRING_INPUT, pattern: formatDate.formatters.Date }, output: EMPTY_OUTPUT },
    { input: { value: NOT_DATE_STRING_INPUT, pattern: formatDate.formatters.DateTime }, output: EMPTY_OUTPUT },
    { input: { value: NOT_DATE_STRING_INPUT, pattern: formatDate.formatters.DateTimeNoSec }, output: EMPTY_OUTPUT },
    { input: { value: NOT_DATE_STRING_INPUT, pattern: formatDate.formatters.Time }, output: EMPTY_OUTPUT },

    { input: { value: null, pattern: formatDate.formatters.Date }, output: EMPTY_OUTPUT },
    { input: { value: null, pattern: formatDate.formatters.DateTime }, output: EMPTY_OUTPUT },
    { input: { value: null, pattern: formatDate.formatters.DateTimeNoSec }, output: EMPTY_OUTPUT },
    { input: { value: null, pattern: formatDate.formatters.Time }, output: EMPTY_OUTPUT },

    { input: { value: false, pattern: formatDate.formatters.Date }, output: EMPTY_OUTPUT },
    { input: { value: false, pattern: formatDate.formatters.DateTime }, output: EMPTY_OUTPUT },
    { input: { value: false, pattern: formatDate.formatters.DateTimeNoSec }, output: EMPTY_OUTPUT },
    { input: { value: false, pattern: formatDate.formatters.Time }, output: EMPTY_OUTPUT },

    { input: { value: undefined, pattern: formatDate.formatters.Date }, output: EMPTY_OUTPUT },
    { input: { value: undefined, pattern: formatDate.formatters.DateTime }, output: EMPTY_OUTPUT },
    { input: { value: undefined, pattern: formatDate.formatters.DateTimeNoSec }, output: EMPTY_OUTPUT },
    { input: { value: undefined, pattern: formatDate.formatters.Time }, output: EMPTY_OUTPUT },
  ].forEach(({ input, output }) =>
    it(`input: ${input.value}, ${input.pattern}`, () => {
      expect(formatDate(input.value, input.pattern, input.locale)).toEqual(output);
    }),
  );
});
