const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(process.env.INIT_CWD);

execSync(`cd ${root} && npx husky install`);

!fs.existsSync(path.resolve(root, '.husky/pre-commit')) &&
  execSync(`cd ${root} && npx husky set .husky/pre-commit node_modules/.bin/lint-staged`);

!fs.existsSync(path.resolve(root, '.husky/pre-push')) &&
  execSync(`cd ${root} && npx husky set .husky/pre-push node_modules/.bin/solidarity`);

!fs.existsSync(path.resolve(root, '.husky/commit-msg')) &&
  execSync(`cd ${root} && npx husky set .husky/commit-msg node_modules/.bin/cloud-ru-commit-message`);

fs.cpSync(path.resolve(__dirname, '.solidarity'), path.resolve(root, '.solidarity'), { recursive: true });
