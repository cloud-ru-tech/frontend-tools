require('@rushstack/eslint-patch/modern-module-resolution');
const { builtinModules } = require('module');

const nodeBuiltinModules = builtinModules.join('|');
const ourOwnModules = ['@cloud', '@snack-ui'].join('|');

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': { typescript: {} },
  },
  extends: [
    'ts-react-important-stuff',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:vitest/recommended',
  ],
  plugins: ['import', 'simple-import-sort', 'vitest'],
  rules: {
    eqeqeq: ['error', 'allow-null'],
    'arrow-body-style': ['error', 'as-needed'],
    'import/no-default-export': 'error',
    'no-unsafe-optional-chaining': 'error',
    'default-case': 'error',
    'no-empty': 'error',
    'prefer-const': 'error',
    'no-else-return': 'error',
    'no-implicit-coercion': ['error', { disallowTemplateShorthand: false }],
    'no-nested-ternary': 'error',
    'no-useless-computed-key': 'error',
    'no-use-before-define': 'error',
    'no-param-reassign': ['error', { props: false }],
    'react/display-name': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration',
      },
    ],
    'react/jsx-fragments': ['error', 'syntax'],
    'react/no-unused-prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
    '@typescript-eslint/no-unused-vars': ['error', { destructuredArrayIgnorePattern: '^_' }],
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          /* import 'foo*' or import '@foo*' */
          [`^\\u0000@?\\w`],
          /* import '@cloud-ru*' or import '@snack-ui*' */
          [`^\\u0000(${ourOwnModules})`],
          /* import '#foo*' */
          ['^\\u0000#\\w'],
          /* import './foo*' or import '../foo*' */
          ['^\\u0000\\.'],
          /* import ... from 'fs' */
          [`^(${nodeBuiltinModules})`],
          /* import ... from 'foo*' or import ... from '@foo*' */
          [`^@?\\w`],
          /* import ... from '@cloud-ru*' or import ... from '@snack-ui*' */
          [`^(${ourOwnModules})`],
          /* import ... from '#foo*' */
          ['^#\\w'],
          /* import ... from './foo*' or import ... from '../foo*' */
          ['^\\.'],
        ],
      },
    ],
    'vitest/consistent-test-it': ['error'],
    'vitest/no-conditional-in-test': 'error',
    'vitest/prefer-equality-matcher': 'error',
  },
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.d.ts', 'vitest.config.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['**/__e2e__/**/*.ts'],
      extends: ['plugin:testcafe-community/recommended'],
    },
  ],
};
