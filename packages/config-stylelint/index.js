module.exports = {
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
    'declaration-no-important': true,
  },
  overrides: [
    {
      files: ['**/*.{js,ts,jsx,tsx}'],
      extends: '@linaria/stylelint-config-standard-linaria',
      customSyntax: '@linaria/postcss-linaria',
      rules: {
        'string-quotes': 'single',
        'selector-attribute-quotes': null,
        'selector-pseudo-class-no-unknown': null,
        'no-eol-whitespace': null,
        indentation: null,
        'value-keyword-case': [
          'lower',
          {
            camelCaseSvgKeywords: true,
          },
        ],
        'custom-property-empty-line-before': null,
        'function-whitespace-after': null,
        'selector-class-pattern': null,
        'block-opening-brace-newline-after': null,
        'declaration-colon-space-after': null,
        'property-no-vendor-prefix': null,
        'selector-type-no-unknown': null,
        'custom-property-pattern': null,
        'value-list-max-empty-lines': null,
        'declaration-colon-newline-after': null,
        'color-function-notation': 'legacy',
      },
    },
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
