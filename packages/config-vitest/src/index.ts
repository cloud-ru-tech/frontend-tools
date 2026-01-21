import path from 'path';

import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config';

import { tsconfigPathsConverter } from './tsconfigPathsConverter';

type Options = {
  /**
   * Environment for unit tests.
   * @default 'jsdom'
   */
  unitEnvironment?: 'node' | 'jsdom';
  /**
   * Whether to use aliases from `tsconfig.json` in root directory.
   * @default true
   */
  useAliases?: boolean;
};

export default function (userConfig?: ViteUserConfig, { unitEnvironment = 'jsdom', useAliases = true }: Options = {}) {
  return mergeConfig(
    defineConfig({
      resolve: {
        alias: useAliases ? tsconfigPathsConverter(path.resolve(process.cwd(), 'tsconfig.json')) : undefined,
      },
      test: {
        snapshotFormat: {
          escapeString: true,
        },
        outputFile: 'reports/unit/unit-report.xml',
        reporters: ['default', 'junit'],
        projects: [
          {
            extends: true,
            test: {
              globals: true,
              include: ['**/__tests__/**/*.spec.(ts|js|tsx|jsx)'],
              exclude: ['**/dist/**', '**/node_modules/**', '**/*.browser.spec.(ts|tsx|js|jsx)'],
              name: 'unit',
              environment: unitEnvironment,
            },
          },
        ],
      },
    }),
    userConfig ?? {},
  );
}
