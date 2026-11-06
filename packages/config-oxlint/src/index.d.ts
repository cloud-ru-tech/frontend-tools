import type { OxlintConfig } from 'oxlint';

export declare const monorepoOxlintConfig: OxlintConfig;
export declare const baseOxlintConfig: OxlintConfig;
export declare function mergeOxlintConfigs(...configs: Array<OxlintConfig | undefined | null | false>): OxlintConfig;
export declare function playwrightTestsOxlintOverride(files: string[]): NonNullable<OxlintConfig['overrides']>[number];

export declare const defaultOxlintConfigRelativePath: 'oxlint.config.mts';
