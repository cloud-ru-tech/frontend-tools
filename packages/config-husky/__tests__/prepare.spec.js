// @vitest-environment node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

import pkg from '../package.json';

test('installs hooks in the project directory and preserves edits to current hooks', ({ onTestFinished }) => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "user's project "));
  onTestFinished(() => fs.rmSync(project, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet', project]);

  const script = fileURLToPath(new URL('../scripts/prepare.js', import.meta.url));
  const install = () =>
    execFileSync(process.execPath, [script], { env: { ...process.env, CI: '', HUSKY: '1', INIT_CWD: project } });
  const hook = name => path.join(project, '.husky', name);
  const prefix = `# ${pkg.version}\nnode_modules/.bin/`;
  const solidarity = path.join(project, '.solidarity');
  fs.writeFileSync(solidarity, 'old settings', { mode: 0o444 });

  install();
  expect(fs.readFileSync(hook('pre-commit'), 'utf8')).toBe(`${prefix}lint-staged\n`);
  expect(fs.readFileSync(hook('pre-push'), 'utf8')).toBe(`${prefix}solidarity\n`);
  expect(fs.readFileSync(hook('commit-msg'), 'utf8')).toBe(`${prefix}cloud-ru-commit-message\n`);
  expect(fs.readFileSync(solidarity)).toEqual(fs.readFileSync(path.join(path.dirname(script), '.solidarity')));

  fs.appendFileSync(hook('pre-commit'), '# custom check\n');
  fs.writeFileSync(hook('pre-push'), '# 0.0.0\n');
  install();
  expect(fs.readFileSync(hook('pre-commit'), 'utf8')).toBe(`${prefix}lint-staged\n# custom check\n`);
  expect(fs.readFileSync(hook('pre-push'), 'utf8')).toBe(`${prefix}solidarity\n`);
});
