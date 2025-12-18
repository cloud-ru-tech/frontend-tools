import fs from 'fs';
import path from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getMonorepoPrefix } from '../src/utils/getMonorepoPrefix';

describe('@cloud-ru/ft-deps-validator/getMonorepoPrefix', () => {
  const testDir = path.join(__dirname, 'temp-test');

  beforeEach(() => {
    // Clean up before each test to avoid interference
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('should return null when folders are empty and root package.json does not exist', () => {
    const cwd = '/non-existent-directory';
    const folders: string[] = [];

    const result = getMonorepoPrefix({ cwd, folders });

    expect(result).toBeNull();
  });

  it('should return null when root package.json does not exist and first package does not have scoped name', () => {
    const cwd = testDir;
    const pkg1Dir = path.join(testDir, 'pkg1');
    fs.mkdirSync(pkg1Dir, { recursive: true });

    const pkg1Json = { name: 'simple-package' };
    fs.writeFileSync(path.join(pkg1Dir, 'package.json'), JSON.stringify(pkg1Json));

    const folders = [pkg1Dir];

    const result = getMonorepoPrefix({ cwd, folders });

    expect(result).toBeNull();
  });

  it('should extract prefix from first package when root package.json does not exist', () => {
    // Use a different directory to ensure root package.json doesn't exist
    const cwd = path.join(testDir, 'no-root');
    fs.mkdirSync(cwd, { recursive: true });

    const pkg1Dir = path.join(cwd, 'pkg1');
    fs.mkdirSync(pkg1Dir, { recursive: true });

    const pkg1Json = { name: '@cloud-ru/ft-test-package' };
    fs.writeFileSync(path.join(pkg1Dir, 'package.json'), JSON.stringify(pkg1Json));

    const folders = [pkg1Dir];

    const result = getMonorepoPrefix({ cwd, folders });

    expect(result).toBe('@cloud-ru');
  });

  it('should return name from root package.json when it exists', () => {
    const cwd = testDir;
    const rootPkgJson = { name: '@cloud-ru/monorepo' };
    fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(rootPkgJson));

    const folders: string[] = [];

    const result = getMonorepoPrefix({ cwd, folders });

    expect(result).toBe('@cloud-ru/monorepo');
  });

  it('should return null when root package.json exists but has no name', () => {
    // Use a different directory to avoid interference from previous tests
    const cwd = path.join(testDir, 'no-name-test');
    fs.mkdirSync(cwd, { recursive: true });

    const rootPkgJson = {};
    fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(rootPkgJson));

    const folders: string[] = [];

    const result = getMonorepoPrefix({ cwd, folders });

    expect(result).toBeNull();
  });

  it('should handle different scoped package names', () => {
    const testCases = [
      { name: '@test/package', expected: '@test' },
      { name: '@my-org/my-package', expected: '@my-org' },
      { name: '@scope/sub/package', expected: '@scope' },
    ];

    testCases.forEach(({ name, expected }) => {
      // Use a different directory for each test case to avoid root package.json interference
      const cwd = path.join(testDir, `test-${name.replace(/[@/]/g, '-')}`);
      fs.mkdirSync(cwd, { recursive: true });

      const pkg1Dir = path.join(cwd, 'pkg1');
      fs.mkdirSync(pkg1Dir, { recursive: true });

      const pkgJson = { name };
      fs.writeFileSync(path.join(pkg1Dir, 'package.json'), JSON.stringify(pkgJson));

      const folders = [pkg1Dir];
      const result = getMonorepoPrefix({ cwd, folders });

      expect(result).toBe(expected);
    });
  });

  it('should return null when neither root package.json nor first package.json exist', () => {
    // Use a different directory to ensure root package.json doesn't exist
    const cwd = path.join(testDir, 'no-root-2');
    fs.mkdirSync(cwd, { recursive: true });

    const pkg1Dir = path.join(cwd, 'non-existent-pkg');

    const folders = [pkg1Dir];

    const result = getMonorepoPrefix({ cwd, folders });

    expect(result).toBeNull();
  });
});
