import baseConfig from './base.js';

export default [
  ...baseConfig,
  {
    files: ['scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['packages/*/stories/*.ts', 'packages/*/stories/*.tsx'],
    rules: { 'import/no-default-export': 'off' },
  },
];
