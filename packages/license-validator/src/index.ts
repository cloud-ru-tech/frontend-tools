#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

import checker, { InitOpts, ModuleInfos } from 'license-checker';

import { logData, logError, logInfo, logWarn } from './console';
import { getPackageJsonFilesPath } from './getPackageJsonFilesPath';
import { splitArray } from './splitArray';

enum License {
  APACHE_V2 = 'Apache-2.0',
  BSD = 'BSD',
  ISC = 'ISC',
  MIT = 'MIT',
  PublicDomain = 'Public Domain',
}

type PackageJson = {
  license?: License;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const INTERNAL_PACKAGE_SCOPES = ['@snack-ui', '@cloud-ru'];

const LICENSES = {
  [License.APACHE_V2]: [License.APACHE_V2, License.BSD, License.MIT, License.PublicDomain, License.ISC],
  [License.BSD]: [License.BSD, License.ISC, License.MIT, License.PublicDomain],
  [License.ISC]: [License.BSD, License.ISC, License.MIT, License.PublicDomain],
  [License.MIT]: [License.MIT, License.PublicDomain],
  [License.PublicDomain]: [License.PublicDomain],
};

function getAllDeps(packageJson?: PackageJson) {
  if (!packageJson) {
    return [];
  }

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  };

  return Object.entries(allDeps);
}

function mapPackagesWithVersion(deps: [string, string][]) {
  return deps.map(([packageName, version]) => `${packageName}@${version}`);
}

function getPackageJson(file: string): PackageJson {
  // eslint-disable-next-line
  return require(path.resolve(file));
}

function getLicenseInfo(props: InitOpts, allowedLicenses: string): Promise<ModuleInfos> {
  return new Promise((resolve, reject) => {
    checker.init(
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        exclude: allowedLicenses,
        ...props,
      },
      function (err, packages) {
        if (err) {
          return reject(err);
        }

        resolve(packages);
      },
    );
  });
}

(async () => {
  try {
    const packageFiles = getPackageJsonFilesPath();
    const projectPackageJSON = getPackageJson('package.json');
    const { license } = projectPackageJSON;

    if (!license || !fs.existsSync('LICENSE')) {
      logError(
        'Project license is not set. Set correct license in package.json and add LICENSE file to a project root',
      );
      process.exit(1);
    }

    const allowedLicenses = LICENSES[license].join(', ');
    const depsToCheck = [
      ...new Set([...packageFiles.flatMap(file => mapPackagesWithVersion(getAllDeps(getPackageJson(file))))]).values(),
    ];

    const [internalDepsToCheck, externalDepsToCheck] = splitArray(depsToCheck, packageName =>
      INTERNAL_PACKAGE_SCOPES.some(scope => packageName.startsWith(scope)),
    );

    logInfo('The followings deps are checked:');
    logData(externalDepsToCheck.map(dep => ` * ${dep}`).join('\n'));
    logData(internalDepsToCheck.map(dep => ` * ${dep}`).join('\n'));

    const externalDepsLicenseInfo = Object.entries(
      await getLicenseInfo({ start: './', packages: externalDepsToCheck.join(';') }, allowedLicenses),
    );
    const internalDepsLicenseInfo = Object.entries(
      await getLicenseInfo({ start: './', packages: internalDepsToCheck.join(';') }, allowedLicenses),
    );

    if (internalDepsLicenseInfo.length > 0) {
      logWarn('[WARNING] The following internal packages have not valid licenses:');
      logWarn(
        internalDepsLicenseInfo.map(([packageName, { licenses }]) => ` * ${packageName}: ${licenses}`).join('\n'),
      );
    }

    if (externalDepsLicenseInfo.length === 0) {
      logInfo('\nAll external licenses are allowed');
      return;
    }

    logError('[ERROR] The following external packages have not valid licenses:');
    logError(externalDepsLicenseInfo.map(([packageName, { licenses }]) => ` * ${packageName}: ${licenses}`).join('\n'));

    logError(`The list of allowed licenses: ${allowedLicenses}`);
    process.exit(1);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    process.exit(1);
  }
})();
