import monorepoEslintConfig from './packages/eslint-config/monorepo.js';

export default [
  ...monorepoEslintConfig,
  {
    files: ['packages/config-commit-message/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: [
      'packages/config-vitest/src/index.ts',
      'packages/eslint-config/**/*.js',
      'packages/eslint-plugin-ssr-safe-react/**/*.js',
      'eslint.config.mjs',
    ],
    rules: { 'import/no-default-export': 'off' },
  },
  {
    files: [
      'packages/eslint-plugin-ssr-safe-react/**/*.js',
      'packages/config-husky/**/*.js',
      'packages/conventional-changelog/**/*.js',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
