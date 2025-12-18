import path from 'path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCliArguments } from '../src/utils/getCliArguments';

describe('@cloud-ru/ft-deps-validator/getCliArguments', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    process.argv = originalArgv;
    vi.clearAllMocks();
  });

  it('should return default values when no arguments provided', () => {
    process.argv = ['node', 'script.js'];
    const result = getCliArguments();

    expect(result.cwd).toBe(process.cwd());
    expect(result.rootPackagesFolderPattern).toBe(path.join(process.cwd(), 'packages/*'));
    expect(result.ignoredPackagesFolderFiles).toEqual([
      path.join(process.cwd(), 'packages', 'tsconfig.cjs.json'),
      path.join(process.cwd(), 'packages', 'tsconfig.esm.json'),
    ]);
    expect(result.ignorePatterns).toEqual(['stories', 'dist', '__tests__', '__e2e__']);
    expect(result.ignoreMatches).toContain('react');
    expect(result.ignoreMatches).toContain('react-dom');
  });

  it('should parse cwd option', () => {
    const testCwd = '/test/directory';
    process.argv = ['node', 'script.js', '--cwd', testCwd];
    const result = getCliArguments();

    expect(result.cwd).toBe(path.resolve(testCwd));
  });

  it('should parse cwd option with alias -d', () => {
    const testCwd = '/test/directory';
    process.argv = ['node', 'script.js', '-d', testCwd];
    const result = getCliArguments();

    expect(result.cwd).toBe(path.resolve(testCwd));
  });

  it('should parse rootPackagesFolderPattern option', () => {
    const pattern = 'apps/*';
    process.argv = ['node', 'script.js', '--rootPackagesFolderPattern', pattern];
    const result = getCliArguments();

    expect(result.rootPackagesFolderPattern).toBe(path.resolve(process.cwd(), pattern));
  });

  it('should parse rootPackagesFolderPattern option with alias -p', () => {
    const pattern = 'apps/*';
    process.argv = ['node', 'script.js', '-p', pattern];
    const result = getCliArguments();

    expect(result.rootPackagesFolderPattern).toBe(path.resolve(process.cwd(), pattern));
  });

  it('should parse prefix option', () => {
    const prefix = '@cloud-ru';
    process.argv = ['node', 'script.js', '--prefix', prefix];
    const result = getCliArguments();

    expect(result.prefix).toBe(prefix);
  });

  it('should parse ignoredPackagesFolderFiles option', () => {
    const files = ['file1.json', 'file2.json'];
    process.argv = ['node', 'script.js', '--ignoredPackagesFolderFiles', ...files];
    const result = getCliArguments();

    expect(result.ignoredPackagesFolderFiles).toEqual(files.map(file => path.resolve(process.cwd(), file)));
  });

  it('should parse ignorePatterns option', () => {
    const patterns = ['test', 'build'];
    process.argv = ['node', 'script.js', '--ignorePatterns', ...patterns];
    const result = getCliArguments();

    expect(result.ignorePatterns).toEqual(patterns);
  });

  it('should parse ignoreMatches option', () => {
    const matches = ['package1', 'package2'];
    process.argv = ['node', 'script.js', '--ignoreMatches', ...matches];
    const result = getCliArguments();

    expect(result.ignoreMatches).toEqual(matches);
  });

  it('should resolve paths relative to cwd', () => {
    const testCwd = '/test/directory';
    const pattern = 'apps/*';
    process.argv = ['node', 'script.js', '--cwd', testCwd, '--rootPackagesFolderPattern', pattern];
    const result = getCliArguments();

    expect(result.cwd).toBe(path.resolve(testCwd));
    expect(result.rootPackagesFolderPattern).toBe(path.resolve(testCwd, pattern));
  });

  it('should resolve ignoredPackagesFolderFiles relative to cwd', () => {
    const testCwd = '/test/directory';
    const files = ['file1.json'];
    process.argv = ['node', 'script.js', '--cwd', testCwd, '--ignoredPackagesFolderFiles', ...files];
    const result = getCliArguments();

    expect(result.ignoredPackagesFolderFiles).toEqual(files.map(file => path.resolve(testCwd, file)));
  });

  it('should use default ignoredPackagesFolderFiles relative to cwd', () => {
    const testCwd = '/test/directory';
    process.argv = ['node', 'script.js', '--cwd', testCwd];
    const result = getCliArguments();

    expect(result.ignoredPackagesFolderFiles).toEqual([
      path.join(testCwd, 'packages', 'tsconfig.cjs.json'),
      path.join(testCwd, 'packages', 'tsconfig.esm.json'),
    ]);
  });
});
