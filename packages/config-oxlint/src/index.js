'use strict';

const { baseOxlintConfig, playwrightTestsOxlintOverride } = require('./presets/base');
const { monorepoOxlintConfig } = require('./presets/monorepo');
const { localJsPlugin, mergeOxlintConfigs } = require('./presets/utils');

exports.monorepoOxlintConfig = monorepoOxlintConfig;
exports.baseOxlintConfig = baseOxlintConfig;
exports.mergeOxlintConfigs = mergeOxlintConfigs;
exports.playwrightTestsOxlintOverride = playwrightTestsOxlintOverride;
exports.boundariesJsPlugin = localJsPlugin('boundaries', 'plugins/boundaries/index.js');

exports.defaultOxlintConfigRelativePath = 'oxlint.config.mts';
