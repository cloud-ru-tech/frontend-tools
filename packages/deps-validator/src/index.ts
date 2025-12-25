#!/usr/bin/env node

import { MonorepoChecker, RepoChecker } from './Checker';
import { MonorepoConfig } from './Config';
import { RepoConfig } from './Config/RepoConfig';
import { logError } from './utils/console';
import { getEnvironment, isMonorepoEnv } from './utils/getEnvironment';

(async () => {
  try {
    const env = getEnvironment();

    const checker = isMonorepoEnv(env)
      ? new MonorepoChecker(new MonorepoConfig(env))
      : new RepoChecker(new RepoConfig(env));

    const report = await checker.check();

    const exitCode = report.printResultAndGetExitCode();

    process.exit(exitCode);
  } catch (e: unknown) {
    logError(`${e}`);
    process.exit(1);
  }
})();
