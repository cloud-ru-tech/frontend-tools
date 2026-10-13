import { defaultOxfmtLintStagedWriteCommand } from '@cloud-ru/ft-config-oxfmt';

/** Prettier + ESLint (`prettier/prettier` on). Pair with `@cloud-ru/eslint-config/monorepo`. */
export const defaultLintStagedConfig = {
  '*.{ts,js,tsx,jsx}': ['eslint --fix', 'prettier --write'],
  '*.scss': ['stylelint --fix'],
};

/** Oxfmt-only formatting in lint-staged (no prettier). Pair with `@cloud-ru/eslint-config/monorepo-oxfmt`. */
export const defaultLintStagedConfigWithOxfmt = {
  '*.{ts,js,tsx,jsx}': ['eslint --fix', defaultOxfmtLintStagedWriteCommand],
  '*.scss': ['stylelint --fix'],
};
