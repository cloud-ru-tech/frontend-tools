import { builtinModules } from 'module';

import eslintJS from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import pluginImport from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintReact from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import eslintTypescript from 'typescript-eslint';

const nodeBuiltinModules = builtinModules.join('|');
const ourOwnModules = ['@cloud', '@snack-ui'].join('|');

export default eslintTypescript.config(
  eslintJS.configs.recommended,
  eslintTypescript.configs.recommended,
  eslintReact.configs.flat.recommended,
  pluginImport.flatConfigs.recommended,
  jsxA11yPlugin.flatConfigs.recommended,
  pluginPrettierRecommended,
  vitest.configs.recommended,
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    plugins: {
      vitest,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      // Possible Errors
      'no-console': [2, { allow: ['warn', 'error', 'info'] }], // sometimes console warnings or console errors are helpful, but console.log probably shouldn't be checked into source control (?)
      'no-constant-condition': 2,
      'no-debugger': 2,
      'no-dupe-args': 2,
      'no-dupe-keys': 2,
      'no-duplicate-case': 2,
      'no-obj-calls': 2,
      'no-unreachable': 2,
      'no-unsafe-negation': 2,
      'use-isnan': 2,

      // Best practices
      'no-empty-pattern': 2,
      'no-extra-bind': 2,
      'no-implied-eval': 2,
      'no-labels': 2,
      'no-self-assign': 2,
      'no-self-compare': 2,
      'no-throw-literal': 2,
      'no-void': 2,
      'no-with': 2,

      // Variables
      'no-shadow-restricted-names': 2,
      /**
       * @see https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
       */
      'no-undef': 0,
      'no-unused-vars': 0, // Finds things like arguments that aren't used but later arguments are used. Or an event handler where the event object isn't used.

      // Stylistic things are enforced by Prettier, so they don't need to be enforced by eslint
      indent: [0, 'tab'], // Enforces a specific number of tab indentations :(
      'no-trailing-spaces': 0, // Somewhat militant, especially for empty lines that sometimes have indentation that matches the line above it.
      'no-mixed-spaces-and-tabs': 0,
      'no-tabs': 0,

      // ES2015 rules
      'constructor-super': 2,
      'no-const-assign': 2,
      'no-dupe-class-members': 2,
      'no-duplicate-imports': 2,
      'no-this-before-super': 2,

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // jsx-a11y rules
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/no-onchange': 'off',

      eqeqeq: ['error', 'allow-null'],
      'arrow-body-style': ['error', 'as-needed'],
      'import/no-default-export': 'error',
      'import/named': 'off',
      'import/no-duplicates': 'off',
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'import/no-dynamic-require': 'error',
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
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-use-before-define': ['error'],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { destructuredArrayIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-prototype-builtins': 'off',
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
      ...vitest.configs.recommended.rules,
      'vitest/consistent-test-it': ['error'],
      'vitest/no-conditional-in-test': 'error',
      'vitest/prefer-equality-matcher': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['*.d.ts', 'eslint.config.mjs', 'vitest.config.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
);
