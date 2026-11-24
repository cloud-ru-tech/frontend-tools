const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

if (process.env.CI) {
  process.exit(0);
}

const versionPrefix = `# ${pkg.version}\n`;
function writeHook(name, command) {
  const hookPath = path.join('.husky', name);
  if (!fs.existsSync(hookPath) || !fs.readFileSync(hookPath, 'utf8').startsWith(versionPrefix)) {
    fs.writeFileSync(hookPath, `${versionPrefix}node_modules/.bin/${command}\n`);
  }
}

function copySolidarityConfig() {
  const source = path.join(__dirname, '.solidarity');
  try {
    fs.copyFileSync(source, '.solidarity');
    return;
  } catch (error) {
    if (error.code !== 'EACCES' && error.code !== 'EPERM') throw error;
  }

  // Like cp -f, replace a read-only destination when its directory is writable.
  const tempDir = fs.mkdtempSync('.solidarity-');
  try {
    const tempFile = path.join(tempDir, '.solidarity');
    fs.copyFileSync(source, tempFile);
    fs.renameSync(tempFile, '.solidarity');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function prepare() {
  const { default: installHusky } = await import('husky');
  process.chdir(process.env.INIT_CWD || process.cwd());
  process.stdout.write(installHusky());

  writeHook('pre-commit', 'lint-staged');
  writeHook('pre-push', 'solidarity');
  writeHook('commit-msg', 'cloud-ru-commit-message');
  copySolidarityConfig();
}

prepare();
