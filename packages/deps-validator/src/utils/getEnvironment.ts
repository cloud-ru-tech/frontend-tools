import fs from 'node:fs';
import path from 'node:path';

import { MonorepoEnvType, RepoEnvType } from '../types';
import { getCliArguments } from './getCliArguments';
import { getConfigFile } from './getConfigFile';

export function getEnvironment(): MonorepoEnvType | RepoEnvType {
  const defaultConfig = {
    cwd: process.cwd(),
    ignoredPackagesFolderFiles: ['packages/tsconfig.cjs.json', 'packages/tsconfig.esm.json'],
    ignorePatterns: ['stories', 'dist', '__tests__', '__e2e__'],
    ignoreMatches: [
      'react',
      'react-dom',
      'react-docgen-typescript',
      '@snack-uikit/figma-tokens',
      '@sbercloud/figma-tokens-cloud-platform',
      '@sbercloud/figma-tokens-mlspace',
      '@sbercloud/figma-tokens-admin',
      '@sbercloud/figma-tokens-web',
      '@sbercloud/figma-tokens-giga-id',
    ],
  };

  const configFile = getConfigFile(defaultConfig.cwd);
  const configArguments = getCliArguments();
  const rootIsNotPassed = !configFile.rootPackagesFolderPattern && !configArguments.ignoredPackagesFolderFiles;

  const rawConfig = Object.assign(
    defaultConfig,
    /* конфиг файл имеет меньший приоритет перед cli-аргументами */
    configFile,
    configArguments,
  );

  if (rootIsNotPassed) {
    /*
      Если папку не передали в конфиге, то проверим на наличие папки сами,
      если она есть, то считаем что это монорепа
    */
    if (fs.existsSync(path.resolve(defaultConfig.cwd, './packages'))) {
      rawConfig.rootPackagesFolderPattern = 'packages/*';
    } else {
      delete rawConfig.rootPackagesFolderPattern;
    }
  }

  return rawConfig;
}

export const isMonorepoEnv = (env: MonorepoEnvType | RepoEnvType): env is MonorepoEnvType =>
  Boolean('rootPackagesFolderPattern' in env);
