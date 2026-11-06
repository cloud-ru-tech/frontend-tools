'use strict';

const { baseOxlintConfig, playwrightTestsOxlintOverride } = require('./presets/base');
const { monorepoOxlintConfig } = require('./presets/monorepo');
const { mergeOxlintConfigs } = require('./presets/utils');

exports.monorepoOxlintConfig = monorepoOxlintConfig;
exports.baseOxlintConfig = baseOxlintConfig;
exports.mergeOxlintConfigs = mergeOxlintConfigs;
exports.playwrightTestsOxlintOverride = playwrightTestsOxlintOverride;

exports.defaultOxlintConfigRelativePath = 'oxlint.config.mts';
