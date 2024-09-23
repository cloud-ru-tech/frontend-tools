import path from 'path';

import { defineConfig, mergeConfig, UserConfig } from 'vitest/config';

import { tsconfigPathsConverter } from './tsconfigPathsConverter';

type DefaultConfigOptions = {
  useAliases?: boolean;
};

const getDefaultConfig = ({ useAliases = true }: DefaultConfigOptions) =>
  defineConfig({
    test: {
      globals: true,
      include: ['**/__tests__/**/*.spec.(ts|js|tsx|jsx)'],

      environment: 'jsdom',
      outputFile: 'reports/unit/unit-report.xml',
      reporters: ['default', 'junit'],
    },
    resolve: {
      alias: useAliases ? tsconfigPathsConverter(path.resolve(process.cwd(), 'tsconfig.json')) : undefined,
    },
  }) as UserConfig;

export default (overrides: UserConfig = {}, options: DefaultConfigOptions = {}) =>
  mergeConfig(getDefaultConfig(options), overrides);
