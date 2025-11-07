import { formatNumber } from '../src';

const WHITESPACE = String.fromCharCode(160);

describe('@sbercloud/ft-formatters/formatNumber', () => {
  [
    {
      input: { value: null },
      output: '–',
    },
    {
      input: { value: undefined },
      output: '–',
    },
    {
      input: { value: NaN },
      output: '–',
    },
    {
      input: { value: Infinity },
      output: '–',
    },
    {
      input: { value: -Infinity },
      output: '–',
    },

    {
      input: { value: '' },
      output: '0',
    },
    { input: { value: 0 }, output: '0' },
    { input: { value: 10 ** 3 }, output: `1${WHITESPACE}000` },
    { input: { value: 10 ** 6 }, output: `1${WHITESPACE}000${WHITESPACE}000` },
    {
      input: { value: Number.MAX_SAFE_INTEGER },
      output: `9${WHITESPACE}007${WHITESPACE}199${WHITESPACE}254${WHITESPACE}740${WHITESPACE}991`,
    },
    {
      input: { value: Number.MIN_SAFE_INTEGER },
      output: `-9${WHITESPACE}007${WHITESPACE}199${WHITESPACE}254${WHITESPACE}740${WHITESPACE}991`,
    },
    {
      input: { value: '999999999999999999' },
      output: `999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999`,
    },
    {
      input: { value: '-999999999999999999' },
      output: `-999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999`,
    },
    {
      input: { value: 999999999999999999n },
      output: `999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999`,
    },
    {
      input: { value: -999999999999999999n },
      output: `-999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999${WHITESPACE}999`,
    },
    {
      input: { value: 0.000000000000000099, args: { precision: 18 } },
      output: '0,000000000000000099',
    },
    {
      input: { value: '0.000000000000000099', args: { precision: 18 } },
      output: '0,000000000000000099',
    },
    { input: { value: 10 ** 3, args: { type: formatNumber.types.DigitSpaces } }, output: `1${WHITESPACE}000` },
    { input: { value: `${10 ** 3}.5`, args: { type: formatNumber.types.DigitSpaces } }, output: `1${WHITESPACE}000,5` },
    {
      input: { value: `${10 ** 3}`, args: { type: formatNumber.types.DigitSpaces, minPrecision: 1 } },
      output: `1${WHITESPACE}000,0`,
    },
    {
      input: { value: `${10 ** 3}.52`, args: { type: formatNumber.types.DigitSpaces, maxPrecision: 1 } },
      output: `1${WHITESPACE}000,5`,
    },

    { input: { value: '', args: { type: formatNumber.types.Currency } }, output: '0 ₽' },
    { input: { value: 10, args: { type: formatNumber.types.Currency } }, output: '10 ₽' },
    { input: { value: 10 ** 3, args: { type: formatNumber.types.Currency } }, output: `1${WHITESPACE}000 ₽` },
    {
      input: { value: 10, args: { minPrecision: 1 } },
      output: '10,0',
    },
    {
      input: { value: 10.555, args: { maxPrecision: 2 } },
      output: '10,56',
    },
    {
      input: { value: 10, args: { minPrecision: 1, maxPrecision: 3 } },
      output: '10,0',
    },
    {
      input: { value: 10.55555, args: { minPrecision: 1, maxPrecision: 3 } },
      output: '10,556',
    },
    {
      input: { value: 10.55555, args: { minPrecision: 1, maxPrecision: 3, unit: 'ГБ' } },
      output: '10,556 ГБ',
    },
    {
      input: {
        value: 10000.55555,
        args: { minPrecision: 1, maxPrecision: 3, type: formatNumber.types.DigitSpaces, unit: 'ГБ' },
      },
      output: `10${WHITESPACE}000,556 ГБ`,
    },
    {
      input: { value: 10.55555, args: { softPrecision: 3 } },
      output: '10,56',
    },
    {
      input: { value: 0, args: { precision: 2 } },
      output: '0,00',
    },
    { input: { value: -0 }, output: '-0' },
    {
      input: { value: -10.55555, args: { minPrecision: 1, maxPrecision: 3 } },
      output: '-10,556',
    },
    { input: { value: -0 }, output: '-0' },
    {
      input: { value: -10.55555, args: { precision: 3 } },
      output: '-10,556',
    },
    {
      input: { value: -10.55555, args: { softPrecision: 3 } },
      output: '-10,56',
    },

    { input: { value: 0, agrs: { language: 'en' } }, output: '0' },
    { input: { value: 10 ** 3, args: { language: 'en' } }, output: `1,000` },
    { input: { value: 10 ** 6, args: { language: 'en' } }, output: `1,000,000` },
    {
      input: { value: 10, args: { minPrecision: 1, language: 'en' } },
      output: '10.0',
    },
    {
      input: { value: 10.555, args: { maxPrecision: 2, language: 'en' } },
      output: '10.56',
    },
    {
      input: { value: 0, args: { precision: 2, language: 'en' } },
      output: '0.00',
    },
  ].forEach(({ input, output }) =>
    it(`input: ${JSON.stringify(input, (_, value) => (typeof value === 'bigint' ? value.toString() : value))}`, () => {
      expect(formatNumber(input.value, { ...input.args })).toEqual(output);
    }),
  );
});
