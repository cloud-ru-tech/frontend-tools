#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

import checker, { InitOpts, ModuleInfos } from 'license-checker';

import { logData, logError, logInfo, logWarn } from './console';
import { getPackageJsonFilesPath } from './getPackageJsonFilesPath';
import { splitArray } from './splitArray';

enum License {
  /**
   * Лицензия не добавляет дополнительных ограничений на Apache-совместимые лицензии
   * Упоминание содержится в разделе 3.3 ("Distribution of a Larger Work")
   * https://github.com/mozilla/webextension-polyfill/blob/master/LICENSE#L185
   */
  MPL_V2 = 'MPL-2.0',
  APACHE_V2 = 'Apache-2.0',
  BSD = 'BSD',
  ISC = 'ISC',
  MIT = 'MIT',
  PublicDomain = 'Public Domain',
  /**
   * https://blueoakcouncil.org/license/1.0.0
   */
  BlueOak_V1 = 'BlueOak-1.0.0',
}

type PackageJson = {
  license?: License;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const INTERNAL_PACKAGE_SCOPES = ['@snack-ui', '@cloud-ru'];

const LICENSES = {
  [License.APACHE_V2]: [
    License.APACHE_V2,
    License.BSD,
    License.MIT,
    License.PublicDomain,
    License.ISC,
    License.MPL_V2,
    License.BlueOak_V1,
  ],
  [License.BSD]: [License.BSD, License.ISC, License.MIT, License.PublicDomain],
  [License.ISC]: [License.BSD, License.ISC, License.MIT, License.PublicDomain],
  [License.MIT]: [License.MIT, License.PublicDomain],
  [License.PublicDomain]: [License.PublicDomain],
  [License.MPL_V2]: [License.APACHE_V2, License.MPL_V2],
  [License.BlueOak_V1]: [License.APACHE_V2, License.BlueOak_V1],
};

/**
 * Ищет фактически установленную версию зависимости, поднимаясь по node_modules от
 * директории манифеста.
 *
 * Фильтр `packages` у license-checker сравнивает строку `name@version` буквально,
 * поэтому объявленный специфаер для него бесполезен: каретка (`^1.1.1`), диапазон
 * (`^16.0.0 || ^17.0.0`) и протоколы pnpm (`catalog:`, `workspace:^`) не совпадут
 * ни с чем, и проверка молча пройдёт вхолостую. Сверять нужно установленную версию.
 */
function resolveInstalledVersion(depName: string, fromDir: string): string | undefined {
  let dir = path.resolve(fromDir);

  for (;;) {
    const candidate = path.join(dir, 'node_modules', depName, 'package.json');

    if (fs.existsSync(candidate)) {
      try {
        const { version } = JSON.parse(fs.readFileSync(candidate, 'utf8')) as { version?: string };
        return version;
      } catch {
        return undefined;
      }
    }

    const parent = path.dirname(dir);

    if (parent === dir) {
      return undefined;
    }

    dir = parent;
  }
}

function getAllDeps(packageJson?: PackageJson) {
  if (!packageJson) {
    return [];
  }

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  };

  return Object.keys(allDeps);
}

function mapPackagesWithVersion(depNames: string[], manifestDir: string, unresolved: Set<string>) {
  return depNames.reduce<string[]>((acc, depName) => {
    const version = resolveInstalledVersion(depName, manifestDir);

    if (version) {
      acc.push(`${depName}@${version}`);
    } else {
      unresolved.add(depName);
    }

    return acc;
  }, []);
}

function getPackageJson(file: string): PackageJson {
  // eslint-disable-next-line
  return require(path.resolve(file));
}

function getLicenseInfo(props: InitOpts, allowedLicenses?: string): Promise<ModuleInfos> {
  return new Promise((resolve, reject) => {
    const options: InitOpts = { ...props };

    if (allowedLicenses) {
      // license-checker разбирает `exclude` как строку с запятыми (lib/index.js),
      // хотя в типах объявлен string[].
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      options.exclude = allowedLicenses;
    }

    checker.init(options, function (err, packages) {
      if (err) {
        return reject(err);
      }

      resolve(packages);
    });
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
    const unresolvedDeps = new Set<string>();

    // Обход ведётся от директории каждого манифеста, а не только от корня проекта:
    // в раскладке pnpm зависимости пакета лежат в packages/<pkg>/node_modules и из
    // корня недостижимы, поэтому проверка от './' видела бы лишь корневые deps.
    const manifests = packageFiles.map(file => {
      const dir = path.dirname(path.resolve(file));

      return { dir, deps: mapPackagesWithVersion(getAllDeps(getPackageJson(file)), dir, unresolvedDeps) };
    });

    const allDepsToCheck = [...new Set(manifests.flatMap(({ deps }) => deps)).values()];
    const [internalDepsToCheck, externalDepsToCheck] = splitArray(allDepsToCheck, packageName =>
      INTERNAL_PACKAGE_SCOPES.some(scope => packageName.startsWith(scope)),
    );

    logInfo('The followings deps are checked:');
    logData(externalDepsToCheck.map(dep => ` * ${dep}`).join('\n'));
    logData(internalDepsToCheck.map(dep => ` * ${dep}`).join('\n'));

    if (unresolvedDeps.size > 0) {
      logWarn('[WARNING] The following deps are declared but not installed, so their licenses are not checked:');
      logWarn([...unresolvedDeps].map(dep => ` * ${dep}`).join('\n'));
    }

    const matchedExternal = new Set<string>();
    const externalViolations = new Map<string, string>();
    const internalViolations = new Map<string, string>();

    for (const { dir, deps } of manifests) {
      if (deps.length === 0) {
        continue;
      }

      const [internal, external] = splitArray(deps, packageName =>
        INTERNAL_PACKAGE_SCOPES.some(scope => packageName.startsWith(scope)),
      );

      if (external.length > 0) {
        const packages = external.join(';');

        // Первый вызов без `exclude` — чтобы знать, сколько пакетов вообще попало под
        // фильтр: без этого пустой список нарушений неотличим от «проверять было нечего».
        Object.keys(await getLicenseInfo({ start: dir, packages })).forEach(name => matchedExternal.add(name));

        for (const [name, info] of Object.entries(await getLicenseInfo({ start: dir, packages }, allowedLicenses))) {
          externalViolations.set(name, String(info.licenses));
        }
      }

      if (internal.length > 0) {
        const info = await getLicenseInfo({ start: dir, packages: internal.join(';') }, allowedLicenses);

        for (const [name, { licenses }] of Object.entries(info)) {
          internalViolations.set(name, String(licenses));
        }
      }
    }

    // Пустой список нарушений сам по себе ничего не доказывает: он одинаково выглядит
    // и когда всё в порядке, и когда проверять было нечего. Считаем объявленным всё, что
    // нашлось в манифестах, включая неразрешённое, — иначе неустановленные зависимости
    // дали бы пустой список и проверка снова прошла бы вхолостую.
    const declaredCount = externalDepsToCheck.length + unresolvedDeps.size;

    if (declaredCount > 0 && matchedExternal.size === 0) {
      logError('[ERROR] License check matched no packages at all — the result is meaningless.');
      logError(
        `Declared deps: ${declaredCount}, matched in node_modules: 0. Install dependencies before running the check.`,
      );
      process.exit(1);
    }

    logInfo(`Licenses checked for ${matchedExternal.size} of ${externalDepsToCheck.length} external deps`);

    const externalDepsLicenseInfo = [...externalViolations.entries()];
    const internalDepsLicenseInfo = [...internalViolations.entries()];

    if (internalDepsLicenseInfo.length > 0) {
      logWarn('[WARNING] The following internal packages have not valid licenses:');
      logWarn(internalDepsLicenseInfo.map(([packageName, licenses]) => ` * ${packageName}: ${licenses}`).join('\n'));
    }

    if (externalDepsLicenseInfo.length === 0) {
      logInfo('\nAll external licenses are allowed');
      return;
    }

    logError('[ERROR] The following external packages have not valid licenses:');
    logError(externalDepsLicenseInfo.map(([packageName, licenses]) => ` * ${packageName}: ${licenses}`).join('\n'));

    logError(`The list of allowed licenses: ${allowedLicenses}`);
    process.exit(1);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    process.exit(1);
  }
})();
