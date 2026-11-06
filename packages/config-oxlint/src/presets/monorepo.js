'use strict';

const { baseOxlintConfig } = require('./base');
const { mergeOxlintConfigs } = require('./utils');

const monorepoOxlintConfig = mergeOxlintConfigs(baseOxlintConfig, {
  overrides: [
    {
      files: ['scripts/**/*.ts', 'scripts/**/*.mts'],
      rules: { 'no-console': 'off' },
    },
    {
      files: ['packages/*/stories/*.ts', 'packages/*/stories/*.tsx'],
      rules: { 'no-restricted-exports': 'off' },
    },
  ],
});

module.exports = { monorepoOxlintConfig };
