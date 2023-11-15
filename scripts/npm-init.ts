import inquirer from 'inquirer';
import shell from 'shelljs';

import { logDebug, logError, logHelp, logInfo, logSilly } from './utils/console';
import { bootstrapFiles, ExistingPackageNames } from './utils/files';
import * as gitUtils from './utils/git';

const user = gitUtils.getGitUserName();
const email = gitUtils.getGitEmail();

gitUtils.gitFetch();
gitUtils.checkIfBehindMaster();

const generatePackageName = (title: string) => title.trim().replace(/\s+/g, '-').toLowerCase();

const generatePackageTitle = (input: string) =>
  input
    .toLowerCase()
    .replace(/(^| )(\w)/g, x => x.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();

const printInfoMessages = () => {
  logInfo(`Package Title format (the script will throw a validation error if you dont follow these rules):
  1. Can only contain a-z,A-Z,0-9 and spaces
  2. Has to be unique
  3. Will automatically be Capitalized`);

  logInfo(`The package title will be used for:
  1. Package Title in package.json (obviously :)) (Example package name: "My New Package")
  2. Folder- and filenames - will be converted to lowercase and hyphen-separated (for example my-new-package)`);

  logHelp('Answer the following questions to get started, or press CTRL+C (or Control+C) to abort...');
};

printInfoMessages();

inquirer
  .prompt([
    {
      type: 'input',
      name: 'packageTitle',
      message: 'Package Title',
      filter: input => generatePackageTitle(input),
      validate: input => {
        if (!input.match(/^([0-9a-zA-Z]+ ?)*$/)) {
          return 'Package title can only contain letters a-z, A-Z, numbers 0-9 and spaces';
        }
        if (ExistingPackageNames.includes(generatePackageName(input))) {
          return `A package with the name ${input} already exists - please see if it fits your use-case, or choose a different name`;
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'packageDescription',
      message: 'Package Description',
      default: '',
    },
    {
      type: 'input',
      name: 'packageKeywords',
      message: 'Package Keywords (write through the space)',
      default: '',
    },
  ])
  .then(answers => {
    logDebug('Removing bootstrapped files...');
    shell.exec('npm run clean:modules', { silent: true });

    logDebug('Generating files...');

    const packageTitle = answers.packageTitle.trim();
    const packageName = generatePackageName(packageTitle);
    const packageKeywords = answers.packageKeywords.toLowerCase().split(' ');

    bootstrapFiles({
      user,
      email,
      packageName,
      packageKeywords,
      packageDescription: answers.packageDescription,
    });

    logDebug('Finished generating files!');
    logInfo('Bootstrapping new package...This will take a few moments...');

    const bootstrapResult = shell.exec('npm run deps:all && npm run build:packages', { silent: true });
    if (bootstrapResult.code !== 0) {
      logError(bootstrapResult.stdout);
      logError(bootstrapResult.stderr);
      logError('Uh oh... something went wrong in bootstrapping the package...');
      logError('Check the error message above, or seek help in #frontend channel in Slack');
      process.exit(1);
    } else {
      logSilly('Finished bootstrapping!');
      logInfo(`Your new package is located in packages/${packageName}`);
      logHelp('You can start working on the package now :)');
    }
  });
