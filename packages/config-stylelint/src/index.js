import { RULE_NAMES } from './const.js';
import { noPureGlobal } from './rules/noPureGlobal.js';

// eslint-disable-next-line import/no-default-export
export default {
  plugins: [noPureGlobal],
  rules: {
    'color-no-hex': [
      true,
      { severity: 'error', message: `Don't use hex colors like HEX, you should use token instead` },
    ],
    'function-disallowed-list': [
      ['/^rgb$/', '/^rgba$/', '/^hsl$/', '/^hwb$/', '/^lab$/', '/^lch$/', '/^color&/', '/^oklab$/', '/^oklch$/'],
      {
        severity: 'error',
        message: `Don't use color functions like rgb, rgba, hsl and etc., you should use token instead`,
      },
    ],
    'color-named': [
      'never',
      {
        severity: 'error',
        message: `Don't use named colors, you should use token instead`,
      },
    ],
    'declaration-property-value-allowed-list': [
      { 'z-index': ['initial'] },
      {
        message:
          'Property "z-index" is restricted from use. Docs: https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-stylelint#z-index',
      },
    ],
    [RULE_NAMES.noPureGlobal]: true,
  },
  overrides: [
    {
      files: ['*.scss', '**/*.scss'],
      extends: ['stylelint-config-recommended-scss'],
      customSyntax: 'postcss-scss',
      rules: {
        'scss/at-import-partial-extension': null,
      },
    },
  ],
};
