#!/usr/bin/env node
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import simpleGit from 'simple-git';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

type Package = {
  packagePath: string;
  version: string;
  packageName: string;
  deps: Record<string, string>;
  changedDeps: { packageName: string; packagePath: string }[];
};

type WriteChangesOptions = {
  packages: Package[];
  currentProjectUrl: string;
  defaultBranch: string;
};

const git = simpleGit();

const commitMessage = '[ci skip] Version and changelog releases';
const changelogFile = 'CHANGELOG.md';

const generateConventionalCommitsChangelog = () => {
  const lernaParameters = [
    'version',
    '--conventional-commits',
    '--include-merged-tags',
    '--exact',
    '--no-push',
    '--no-git-tag-version',
    '--yes',
  ];
  execFileSync('lerna', lernaParameters, { stdio: 'inherit' });
};

const createTags = () => {
  const lernaParameters = [
    'version',
    '--conventional-commits',
    '--no-changelog',
    '--include-merged-tags',
    '--exact',
    '--amend',
    '--yes',
  ];
  execFileSync('lerna', lernaParameters, { stdio: 'inherit' });
};

const findChangedDependencies = (allFiles: string[]) => {
  const changedPackages = allFiles
    .filter(file => file.includes(changelogFile))
    .map(changedFilePath => {
      const extractedPath = changedFilePath.replace(changelogFile, '');
      const packageDescription = JSON.parse(readFileSync(`${extractedPath}package.json`, 'utf8'));
      return {
        packagePath: extractedPath,
        packageName: packageDescription.name,
        version: packageDescription.version,
        deps: packageDescription.dependencies,
      };
    }) as Package[];
  const findDependencies = (bumpedPackages: Package[]) => (pkg: Package) => {
    const changedDeps = bumpedPackages
      .filter(({ packageName }) => pkg?.deps?.[packageName])
      .map(({ packageName, version, packagePath }) => ({
        packageName: `${packageName}@${version}`,
        packagePath,
      }));
    return { ...pkg, changedDeps: changedDeps };
  };

  return changedPackages.map(findDependencies(changedPackages));
};

const writeChangedDependencies = ({ packages, currentProjectUrl, defaultBranch }: WriteChangesOptions) => {
  const changedDepsHeader = '### Only dependencies have been changed\n';
  const replaceText = '**Note:** Version bump only for package';

  packages.forEach((pkg: Package) => {
    if (!pkg.changedDeps.length) return;

    const changelogPath = join(pkg.packagePath, changelogFile);
    const fileData = readFileSync(changelogPath, 'utf8');
    const depsString = pkg.changedDeps
      .map(({ packageName, packagePath }) => {
        const pathToChangelog = join(currentProjectUrl, '/blob/', defaultBranch, packagePath, changelogFile).replace(
          ':/',
          '://',
        );
        return `* [${packageName}](${pathToChangelog})`;
      })
      .join('\n');
    const newFileData = fileData.replace(`${replaceText} ${pkg.packageName}`, `${changedDepsHeader}${depsString}`);
    writeFileSync(changelogPath, newFileData);
  });
};

const getArgs = async (): Promise<{ projectUrl: string; defaultBranch: string }> => {
  try {
    const argv = await yargs(hideBin(process.argv)).argv;

    return {
      projectUrl: typeof argv.projectUrl === 'string' ? argv.projectUrl : '',
      defaultBranch: typeof argv.defaultBranch === 'string' ? argv.defaultBranch : '',
    };
  } catch {
    return { projectUrl: '', defaultBranch: '' };
  }
};

const generateChangelog = async () => {
  generateConventionalCommitsChangelog();

  const status = await git.status();
  const allFiles = [...status.created, ...status.modified];
  const filesToRestore = allFiles.filter(file => !file.includes(changelogFile));
  if (allFiles.length === 0) {
    console.warn('No new versions have been released');
    return 'false';
  }

  const { projectUrl, defaultBranch } = await getArgs();
  const packagesWithChangedDeps = findChangedDependencies(allFiles);
  writeChangedDependencies({
    packages: packagesWithChangedDeps,
    currentProjectUrl: projectUrl || process.env['CI_PROJECT_URL'] || '',
    defaultBranch: defaultBranch || process.env['CI_DEFAULT_BRANCH'] || '',
  });

  await git.checkout(filesToRestore);
  await git.add('./*').commit(commitMessage);
  createTags();
  await git.push().pushTags();

  return 'true';
};

generateChangelog().then(x => process.stdout.write(x));
