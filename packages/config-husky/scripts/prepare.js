const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

if (process.env.CI) {
  process.exit(0);
}

const versionPrefix = `# ${pkg.version}\n`;
const targetDirectoryRoot = process.env.INIT_CWD || process.cwd();
const commandCommonPrefix = `cd ${targetDirectoryRoot} && echo "${versionPrefix}node_modules/.bin/`;
const precommitPath = path.resolve(targetDirectoryRoot, '.husky/pre-commit');
const prepushPath = path.resolve(targetDirectoryRoot, '.husky/pre-push');
const precommitmsgPath = path.resolve(targetDirectoryRoot, '.husky/commit-msg');

function shouldUpdate(path) {
  return !fs.existsSync(path) || !fs.readFileSync(path).toString().startsWith(versionPrefix);
}

execSync(`cd ${targetDirectoryRoot} && husky`);

if (shouldUpdate(precommitPath)) {
  execSync(`${commandCommonPrefix}lint-staged" > .husky/pre-commit`);
}

if (shouldUpdate(prepushPath)) {
  execSync(`${commandCommonPrefix}solidarity" > .husky/pre-push`);
}

if (shouldUpdate(precommitmsgPath)) {
  execSync(`${commandCommonPrefix}cloud-ru-commit-message" > .husky/commit-msg`);
}

execSync(`cp -f ${path.resolve(__dirname, '.solidarity')} ${path.resolve(targetDirectoryRoot, '.solidarity')}`);
