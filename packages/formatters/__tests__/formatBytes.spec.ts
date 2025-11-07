import { formatBytes } from '../src';

describe('@cloud-ru/ft-formatters/formatBytes', () => {
  [
    { input: 0, output: '0 Б' },
    { input: 2 ** 10, output: '1 КБ' },
    { input: 1536, output: '1.5 КБ' },
    { input: 1587, output: '1.55 КБ' },
    { input: 1597, output: '1.56 КБ' },
    { input: 2 ** 10 * 10, output: '10 КБ' },
    { input: 2 ** 20, output: '1 МБ' },
    { input: 2 ** 30, output: '1 ГБ' },
    { input: 2 ** 40, output: '1 ТБ' },
    { input: 2 ** 50, output: '1 ПБ' },
  ].forEach(({ input, output }) =>
    it(`RU input: ${input}`, () => {
      expect(formatBytes(input, formatBytes.languages.Ru)).toEqual(output);
    }),
  );

  [
    { input: 0, language: formatBytes.languages.En, output: '0 B' },
    { input: 2 ** 10, output: '1 KB' },
    { input: 2 ** 20, output: '1 MB' },
    { input: 2 ** 30, output: '1 GB' },
    { input: 2 ** 40, output: '1 TB' },
    { input: 2 ** 50, output: '1 PB' },
  ].forEach(({ input, output }) =>
    it(`EN input: ${input}`, () => {
      expect(formatBytes(input, formatBytes.languages.En)).toEqual(output);
    }),
  );
});
