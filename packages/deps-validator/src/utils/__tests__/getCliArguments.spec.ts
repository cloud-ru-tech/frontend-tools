import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCliArguments } from '../getCliArguments';

describe('@cloud-ru/ft-deps-validator/getCliArguments', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    process.argv = originalArgv;
    vi.clearAllMocks();
  });

  it('should return empty object when no arguments provided', () => {
    process.argv = ['node', 'script.js'];
    const result = getCliArguments();

    expect(result.cwd).toBeUndefined();
    expect(result.rootPackagesFolderPattern).toBeUndefined();
    expect(result.ignoredPackagesFolderFiles).toBeUndefined();
    expect(result.ignoreFilePatterns).toBeUndefined();
    expect(result.ignorePackagePatterns).toBeUndefined();
  });

  it('should parse cwd option', () => {
    const testCwd = '/test/directory';
    process.argv = ['node', 'script.js', '--cwd', testCwd];
    const result = getCliArguments();

    expect(result.cwd).toBe(testCwd);
  });

  it('should parse cwd option with alias -d', () => {
    const testCwd = '/test/directory';
    process.argv = ['node', 'script.js', '-d', testCwd];
    const result = getCliArguments();

    expect(result.cwd).toBe(testCwd);
  });

  it('should parse rootPackagesFolderPattern option', () => {
    const pattern = 'apps/*';
    process.argv = ['node', 'script.js', '--rootPackagesFolderPattern', pattern];
    const result = getCliArguments();

    expect(result.rootPackagesFolderPattern).toBe(pattern);
  });

  it('should parse rootPackagesFolderPattern option with alias -p', () => {
    const pattern = 'apps/*';
    process.argv = ['node', 'script.js', '-p', pattern];
    const result = getCliArguments();

    expect(result.rootPackagesFolderPattern).toBe(pattern);
  });

  it('should parse ignoredPackagesFolderFiles option', () => {
    const files = ['file1.json', 'file2.json'];
    process.argv = ['node', 'script.js', '--ignoredPackagesFolderFiles', ...files];
    const result = getCliArguments();

    expect(result.ignoredPackagesFolderFiles).toEqual(files);
  });

  it('should parse ignoreFilePatterns option', () => {
    const patterns = ['test', 'build'];
    process.argv = ['node', 'script.js', '--ignoreFilePatterns', ...patterns];
    const result = getCliArguments();

    expect(result.ignoreFilePatterns).toEqual(patterns);
  });

  it('should parse ignorePackagePatterns option', () => {
    const matches = ['package1', 'package2'];
    process.argv = ['node', 'script.js', '--ignorePackagePatterns', ...matches];
    const result = getCliArguments();

    expect(result.ignorePackagePatterns).toEqual(matches);
  });

  it('should parse multiple options together', () => {
    const testCwd = '/test/directory';
    const pattern = 'apps/*';
    process.argv = ['node', 'script.js', '--cwd', testCwd, '--rootPackagesFolderPattern', pattern];
    const result = getCliArguments();

    expect(result.cwd).toBe(testCwd);
    expect(result.rootPackagesFolderPattern).toBe(pattern);
  });
});
