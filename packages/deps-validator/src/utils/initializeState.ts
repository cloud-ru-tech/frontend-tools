import path from 'path';

import { State } from '../types/state';
import { getMonorepoPrefix } from './getMonorepoPrefix';

type Options = {
  cwd: string;
  folders: string[];
  prefix?: string;
};

export function initializeState({ cwd, folders, prefix }: Options): State {
  const internalPackages: Record<string, string> = {};
  const initialState: State = {
    wrongVersions: [],
    internalAsDev: [],
    unusedDeps: [],
    missing: [],
  };

  const monorepoName = prefix || getMonorepoPrefix({ cwd, folders });
  if (!monorepoName) {
    throw new Error('[ERROR] Prefix was not specified and was not found');
  }

  const monorepoPackageRegexp = new RegExp(`${monorepoName}\\/`);

  for (const folder of folders) {
    // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
    const pkg = require(path.resolve(folder, 'package.json'));
    internalPackages[pkg.name] = pkg.version;
  }

  for (const folder of folders) {
    // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
    const pkg = require(path.resolve(folder, 'package.json'));
    const usedInternal = Object.keys(pkg.dependencies || {}).filter(x => monorepoPackageRegexp.test(x));
    usedInternal.forEach(dep => {
      if (pkg.dependencies[dep] !== internalPackages[dep]) {
        initialState.wrongVersions.push(
          `Error in ${pkg.name}: ${dep} has ${pkg.dependencies[dep]}, but correct version is ${internalPackages[dep]}`,
        );
      }
    });

    const usedInternalDev = Object.keys(pkg.devDependencies || {}).filter(x => monorepoPackageRegexp.test(x));
    usedInternalDev.forEach(dep => initialState.internalAsDev.push(`Error in ${pkg.name}: ${dep}`));
  }

  return initialState;
}
