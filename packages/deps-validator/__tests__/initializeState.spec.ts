import fs from 'fs';
import path from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initializeState } from '../src/utils/initializeState';

describe('@cloud-ru/ft-deps-validator/initializeState', () => {
  const testDir = path.join(__dirname, 'temp-test-state');

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
  });

  it('should initialize empty state when no packages provided', () => {
    const cwd = testDir;
    const folders: string[] = [];
    const prefix = '@cloud-ru';

    const result = initializeState({ cwd, folders, prefix });

    expect(result.wrongVersions).toEqual([]);
    expect(result.internalAsDev).toEqual([]);
    expect(result.unusedDeps).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it('should throw error when prefix is not provided and cannot be determined', () => {
    const cwd = '/non-existent';
    const folders: string[] = [];

    expect(() => {
      initializeState({ cwd, folders });
    }).toThrow('[ERROR] Prefix was not specified and was not found');
  });

  it('should detect wrong versions when internal package version mismatch', () => {
    const cwd = testDir;
    const pkg1Dir = path.join(testDir, 'pkg1');
    const pkg2Dir = path.join(testDir, 'pkg2');

    fs.mkdirSync(pkg1Dir, { recursive: true });
    fs.mkdirSync(pkg2Dir, { recursive: true });

    // Package 1 - wrong version in dependencies
    const pkg1Json = {
      name: '@cloud-ru/pkg1',
      version: '1.0.0',
      dependencies: {
        '@cloud-ru/pkg2': '2.0.0', // Wrong version
      },
    };
    fs.writeFileSync(path.join(pkg1Dir, 'package.json'), JSON.stringify(pkg1Json));

    // Package 2 - actual version is 1.0.0
    const pkg2Json = {
      name: '@cloud-ru/pkg2',
      version: '1.0.0',
    };
    fs.writeFileSync(path.join(pkg2Dir, 'package.json'), JSON.stringify(pkg2Json));

    const folders = [pkg1Dir, pkg2Dir];
    const prefix = '@cloud-ru';

    const result = initializeState({ cwd, folders, prefix });

    expect(result.wrongVersions).toHaveLength(1);
    expect(result.wrongVersions[0]).toBe(
      'Error in @cloud-ru/pkg1: @cloud-ru/pkg2 has 2.0.0, but correct version is 1.0.0',
    );
  });

  it('should detect internal packages in devDependencies', () => {
    const testCaseDir = path.join(testDir, 'dev-deps-test');
    fs.mkdirSync(testCaseDir, { recursive: true });

    const cwd = testCaseDir;
    const pkg1Dir = path.join(testCaseDir, 'pkg1');
    const pkg2Dir = path.join(testCaseDir, 'pkg2');

    fs.mkdirSync(pkg1Dir, { recursive: true });
    fs.mkdirSync(pkg2Dir, { recursive: true });

    // Package 1 - has internal package in devDependencies
    const pkg1Json = {
      name: '@cloud-ru/pkg1',
      version: '1.0.0',
      devDependencies: {
        '@cloud-ru/pkg2': '1.0.0',
      },
    };
    fs.writeFileSync(path.join(pkg1Dir, 'package.json'), JSON.stringify(pkg1Json));

    // Package 2
    const pkg2Json = {
      name: '@cloud-ru/pkg2',
      version: '1.0.0',
    };
    fs.writeFileSync(path.join(pkg2Dir, 'package.json'), JSON.stringify(pkg2Json));

    // Clear require cache to avoid interference
    const pkg1Path = path.resolve(pkg1Dir, 'package.json');
    const pkg2Path = path.resolve(pkg2Dir, 'package.json');
    delete require.cache[pkg1Path];
    delete require.cache[pkg2Path];

    const folders = [pkg1Dir, pkg2Dir];
    const prefix = '@cloud-ru';

    const result = initializeState({ cwd, folders, prefix });

    expect(result.internalAsDev).toHaveLength(1);
    expect(result.internalAsDev[0]).toBe('Error in @cloud-ru/pkg1: @cloud-ru/pkg2');
  });

  it('should not detect external packages', () => {
    const cwd = testDir;
    const pkg1Dir = path.join(testDir, 'pkg1');

    fs.mkdirSync(pkg1Dir, { recursive: true });

    const pkg1Json = {
      name: '@cloud-ru/pkg1',
      version: '1.0.0',
      devDependencies: {
        'external-package': '1.0.0',
      },
      dependencies: {
        'other-external-package': '1.0.0',
      },
    };
    fs.writeFileSync(path.join(pkg1Dir, 'package.json'), JSON.stringify(pkg1Json));

    const folders = [pkg1Dir];
    const prefix = '@cloud-ru';

    const result = initializeState({ cwd, folders, prefix });

    expect(result.internalAsDev).toEqual([]);
  });

  it('should handle packages without dependencies', () => {
    const testCaseDir = path.join(testDir, 'no-deps-test');
    fs.mkdirSync(testCaseDir, { recursive: true });

    const cwd = testCaseDir;
    const pkg1Dir = path.join(testCaseDir, 'pkg1');

    fs.mkdirSync(pkg1Dir, { recursive: true });

    const pkg1Json = {
      name: '@cloud-ru/pkg1',
      version: '1.0.0',
    };
    fs.writeFileSync(path.join(pkg1Dir, 'package.json'), JSON.stringify(pkg1Json));

    // Clear require cache
    const pkg1Path = path.resolve(pkg1Dir, 'package.json');
    delete require.cache[pkg1Path];

    const folders = [pkg1Dir];
    const prefix = '@cloud-ru';

    const result = initializeState({ cwd, folders, prefix });

    expect(result.wrongVersions).toEqual([]);
    expect(result.internalAsDev).toEqual([]);
  });

  it('should handle multiple packages with correct versions', () => {
    const testCaseDir = path.join(testDir, 'multi-pkg-test');
    fs.mkdirSync(testCaseDir, { recursive: true });

    const cwd = testCaseDir;
    const pkg1Dir = path.join(testCaseDir, 'pkg1');
    const pkg2Dir = path.join(testCaseDir, 'pkg2');
    const pkg3Dir = path.join(testCaseDir, 'pkg3');

    fs.mkdirSync(pkg1Dir, { recursive: true });
    fs.mkdirSync(pkg2Dir, { recursive: true });
    fs.mkdirSync(pkg3Dir, { recursive: true });

    const pkg1Json = {
      name: '@cloud-ru/pkg1',
      version: '1.0.0',
      dependencies: {
        '@cloud-ru/pkg2': '1.0.0',
        '@cloud-ru/pkg3': '2.0.0',
      },
    };
    fs.writeFileSync(path.join(pkg1Dir, 'package.json'), JSON.stringify(pkg1Json));

    const pkg2Json = {
      name: '@cloud-ru/pkg2',
      version: '1.0.0',
    };
    fs.writeFileSync(path.join(pkg2Dir, 'package.json'), JSON.stringify(pkg2Json));

    const pkg3Json = {
      name: '@cloud-ru/pkg3',
      version: '2.0.0',
    };
    fs.writeFileSync(path.join(pkg3Dir, 'package.json'), JSON.stringify(pkg3Json));

    // Clear require cache
    const pkg1Path = path.resolve(pkg1Dir, 'package.json');
    const pkg2Path = path.resolve(pkg2Dir, 'package.json');
    const pkg3Path = path.resolve(pkg3Dir, 'package.json');
    delete require.cache[pkg1Path];
    delete require.cache[pkg2Path];
    delete require.cache[pkg3Path];

    const folders = [pkg1Dir, pkg2Dir, pkg3Dir];
    const prefix = '@cloud-ru';

    const result = initializeState({ cwd, folders, prefix });

    expect(result.wrongVersions).toEqual([]);
    expect(result.internalAsDev).toEqual([]);
  });

  it('should use getMonorepoPrefix when prefix is not provided', () => {
    const cwd = testDir;
    const pkg1Dir = path.join(testDir, 'pkg1');

    fs.mkdirSync(pkg1Dir, { recursive: true });

    // Create root package.json
    const rootPkgJson = {
      name: '@test-org/monorepo',
    };
    fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(rootPkgJson));

    const pkg1Json = {
      name: '@test-org/pkg1',
      version: '1.0.0',
    };
    fs.writeFileSync(path.join(pkg1Dir, 'package.json'), JSON.stringify(pkg1Json));

    const folders = [pkg1Dir];

    const result = initializeState({ cwd, folders });

    expect(result.wrongVersions).toEqual([]);
    expect(result.internalAsDev).toEqual([]);
  });
});
