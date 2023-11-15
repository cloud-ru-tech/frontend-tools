module.exports = {
  extends: '@cloud-ru/eslint-config/monorepo',
  overrides: [
    {
      files: ['packages/config-commit-message/**/*.ts'],
      rules: { 'no-console': 'off' },
    },
    {
      files: ['packages/config-vitest/src/index.ts'],
      rules: { 'import/no-default-export': 'off' },
    },
  ],
};
