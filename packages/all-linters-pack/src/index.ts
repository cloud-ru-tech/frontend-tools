export * from '@cloud-ru/ft-config-lint-staged';
export { defaultLintStagedConfigWithOxfmt } from '@cloud-ru/ft-config-lint-staged';
import { defaultPrettierConfig as defaultPrettierConfigFromPackage } from '@cloud-ru/ft-config-prettier';
export {
  defaultOxfmtCheckScript,
  defaultOxfmtConfig,
  defaultOxfmtConfigRelativePath,
  defaultOxfmtFixScript,
  defaultOxfmtIgnorePatterns,
  defaultOxfmtLintStagedWriteCommand,
} from '@cloud-ru/ft-config-oxfmt';
export {
  baseOxlintConfig,
  defaultOxlintConfigRelativePath,
  mergeOxlintConfigs,
  monorepoOxlintConfig,
  playwrightTestsOxlintOverride,
} from '@cloud-ru/ft-config-oxlint';

export const defaultPrettierConfig = {
  ...defaultPrettierConfigFromPackage,
  overrides: [
    {
      files: ['*.yml', '*.yaml'],
      options: {
        singleQuote: false,
      },
    },
  ],
};
