const { execSync } = require('child_process');
const { existsSync } = require('fs');

const oldCfgPath = `${process.env.INIT_CWD}/release.config.js`;
const newCfgPath = `${process.env.INIT_CWD}/.releaserc.js`;

const oldCfgExists = existsSync(oldCfgPath);

if (oldCfgExists) {
  execSync(`git mv ${oldCfgPath} ${newCfgPath}`);
}
