module.exports = {
  extends: '@cloud-ru/eslint-config/base',
  overrides: [
    {
      files: ['scripts/**/*.ts'],
      rules: { 'no-console': 'off' },
    },
    {
      files: ['packages/*/stories/*.ts', 'packages/*/stories/*.tsx'],
      rules: { 'import/no-default-export': 'off' },
    },
  ],
};
