// @vitest-environment node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const cliPath = fileURLToPath(new URL('../bin/solidarity.js', import.meta.url));
const directories = [];

function createProject(binary = 'npm', version = '11.20.0') {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'solidarity-'));
  directories.push(cwd);
  fs.writeFileSync(
    path.join(cwd, '.solidarity'),
    JSON.stringify({
      requirements: {
        CLI: [{ rule: 'cli', binary, semver: version, error: 'Unexpected version {{installedVersion}}' }],
      },
    }),
  );
  return cwd;
}

function createBinary(directory, version, binary = 'npm') {
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    path.join(directory, process.platform === 'win32' ? `${binary}.cmd` : binary),
    process.platform === 'win32' ? `@echo ${version}\r\n` : `#!/bin/sh\nprintf '${version}\\n'\n`,
    { mode: 0o755 },
  );
  return directory;
}

function runCli(cwd, entries) {
  const env = { ...process.env };
  const pathKey =
    process.platform === 'win32' ? (Object.keys(env).find(key => key.toUpperCase() === 'PATH') ?? 'PATH') : 'PATH';
  env[pathKey] = entries.join(path.delimiter);
  return spawnSync(process.execPath, [cliPath], { cwd, env, encoding: 'utf8' });
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('Solidarity CLI', () => {
  it.each([
    ['npm', '11.20.0'],
    ['node', '26.13.1'],
    ['pnpm', '10.22.0'],
  ])('should ignore project %s that shadows the user binary', (binary, version) => {
    const cwd = createProject(binary, version);
    const projectBin = createBinary(path.join(cwd, 'node_modules', '.bin'), '0.0.0', binary);
    const userBin = createBinary(path.join(cwd, 'user', 'bin'), version, binary);

    const result = runCli(cwd, [projectBin, userBin]);

    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  it.each([
    ['npm', '11.20.0'],
    ['node', '26.13.1'],
    ['pnpm', '10.22.0'],
  ])('should accept the user %s when no project binary shadows it', (binary, version) => {
    const cwd = createProject(binary, version);
    const userBin = createBinary(path.join(cwd, 'user', 'bin'), version, binary);

    const result = runCli(cwd, [path.join(cwd, 'node_modules', '.bin'), userBin]);

    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  it.each([
    ['npm', '11.20.0'],
    ['node', '26.13.1'],
    ['pnpm', '10.22.0'],
  ])('should reject an incompatible user %s even when a project binary matches', (binary, version) => {
    const cwd = createProject(binary, version);
    const projectBin = createBinary(path.join(cwd, 'node_modules', '.bin'), version, binary);
    const userBin = createBinary(path.join(cwd, 'user', 'bin'), '0.0.0', binary);

    const result = runCli(cwd, [projectBin, userBin]);

    expect(result.status).toBe(2);
    expect(result.stderr + result.stdout).toContain('Unexpected version 0.0.0');
  });

  it('should ignore relative node_modules/.bin entries prepended like husky does', () => {
    const cwd = createProject('npm', '11.20.0');
    createBinary(path.join(cwd, 'node_modules', '.bin'), '0.0.0', 'npm');
    const userBin = createBinary(path.join(cwd, 'user', 'bin'), '11.20.0', 'npm');

    const result = runCli(cwd, ['node_modules/.bin', userBin]);

    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });
});
