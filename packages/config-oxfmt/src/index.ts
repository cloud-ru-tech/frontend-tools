import { defineConfig } from 'oxfmt';

/** Имя ESM TS-конфига в корне (autodiscover; без warning без `"type": "module"`). */
export const defaultOxfmtConfigRelativePath = 'oxfmt.config.mts';

export const defaultOxfmtLintStagedWriteCommand = 'oxfmt --write';

export const defaultOxfmtCheckScript = 'oxfmt --check .';

export const defaultOxfmtFixScript = 'oxfmt --write .';

export const defaultOxfmtIgnorePatterns = ['.cursor', '.claude', 'pnpm-lock.yaml', 'CHANGELOG.md'] as const;

/**
 * Defaults aligned with @cloud-ru/ft-config-prettier and @cloud-ru/ft-all-linters-pack defaultPrettierConfig.
 */
export const defaultOxfmtConfig = defineConfig({
  ignorePatterns: [...defaultOxfmtIgnorePatterns],
  tabWidth: 2,
  printWidth: 120,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  sortPackageJson: false,
  overrides: [
    {
      files: ['*.yml', '*.yaml'],
      options: {
        singleQuote: false,
      },
    },
  ],
});
