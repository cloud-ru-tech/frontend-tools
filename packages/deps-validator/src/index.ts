#!/usr/bin/env node

import depCheck from 'depcheck';
import { globSync } from 'glob';

import { logDebug, logError, logInfo } from './utils/console';
import { getCliArguments } from './utils/getCliArguments';
import { getConfigFile } from './utils/getConfigFile';
import { initializeState } from './utils/initializeState';

(async () => {
  try {
    const args = getCliArguments();
    const configFile = getConfigFile(args.cwd);

    const config = configFile ? Object.assign(args, configFile) : args;

    const options = {
      ignoreBinPackage: false,
      skipMissing: false,
      ignorePatterns: config.ignorePatterns.map(pattern => pattern.toString()),
      ignoreMatches: config.ignoreMatches.map(match => match.toString()),
    };

    const folders = globSync(config.rootPackagesFolderPattern, {
      ignore: config.ignoredPackagesFolderFiles.map(path => path.toString()),
    });
    const state = initializeState({
      cwd: args.cwd,
      folders,
      prefix: config.prefix,
    });

    for (const folder of folders) {
      const { dependencies, missing: missingDepsPerPackage } = await depCheck(folder, options);

      state.unusedDeps.push(...dependencies.map(x => `${folder}: ${x}`));

      if (Object.keys(missingDepsPerPackage).length) {
        state.missing.push(missingDepsPerPackage);
      }
    }

    if (Object.values(state).every(result => result.length < 1)) {
      logInfo('Dependencies have been checked. Everything is ok.');
      process.exit(0);
      return;
    }

    if (state.wrongVersions.length) {
      logError('You have to fix wrong version of internal packages:');
      state.wrongVersions.forEach(logDebug);
    }

    if (state.internalAsDev.length) {
      logError(
        'You have to fix wrong usage of internal packages in dev dependencies (either delete them or move to dependencies):',
      );
      state.internalAsDev.forEach(logDebug);
    }

    if (state.unusedDeps.length) {
      logError('You have to fix following unused dependencies:');
      state.unusedDeps.forEach(logDebug);
    }

    if (state.missing.length) {
      logError('You have to fix following missed dependencies:');
      state.missing.forEach(x => logDebug(JSON.stringify(x, null, 2)));
    }

    process.exit(1);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
