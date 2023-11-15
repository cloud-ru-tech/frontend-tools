import path from 'path';

import { defineConfig, mergeConfig, UserConfig } from 'vitest/config';

import { tsconfigPathsConverter } from './tsconfigPathsConverter';

const defaultConfig = defineConfig({
  test: {
    globals: true,
    include: ['**/__tests__/**/*.spec.(ts|js|tsx|jsx)'],

    environment: 'jsdom',
    outputFile: 'reports/unit/unit-report.xml',
    reporters: ['default', 'junit'],
  },
  resolve: {
    alias: tsconfigPathsConverter(path.resolve(process.cwd(), 'tsconfig.json')),
  },
}) as UserConfig;

export default (overrides: UserConfig = {}) => mergeConfig(defaultConfig, overrides);
