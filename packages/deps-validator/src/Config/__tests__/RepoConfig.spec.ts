import path from 'path';

import { describe, expect, it } from 'vitest';

import { RepoConfig } from '../RepoConfig';

describe('RepoConfig', () => {
  describe('constructor', () => {
    it('should initialize with cwd and resolve path', () => {
      const testCwd = '/test/directory';
      const config = new RepoConfig({ cwd: testCwd });

      expect(config.getFolders()).toEqual([path.resolve(testCwd)]);
    });

    it('should initialize with ignoreFilePatterns', () => {
      const testCwd = '/test/directory';
      const ignoreFilePatterns = ['dist', 'node_modules'];
      const config = new RepoConfig({ cwd: testCwd, ignoreFilePatterns });

      const options = config.getDepcheckOptionsForFolder('any-folder');

      expect(options.ignorePatterns).toEqual(ignoreFilePatterns);
    });

    it('should initialize with ignorePackagePatterns', () => {
      const testCwd = '/test/directory';
      const ignorePackagePatterns = ['@cloud-ru/package1', '@cloud-ru/package2'];
      const config = new RepoConfig({ cwd: testCwd, ignorePackagePatterns });

      const options = config.getDepcheckOptionsForFolder('any-folder');

      expect(options.ignoreMatches).toEqual(ignorePackagePatterns);
    });

    it('should initialize with both ignoreFilePatterns and ignorePackagePatterns', () => {
      const testCwd = '/test/directory';
      const ignoreFilePatterns = ['dist'];
      const ignorePackagePatterns = ['@cloud-ru/package'];
      const config = new RepoConfig({ cwd: testCwd, ignoreFilePatterns, ignorePackagePatterns });

      const options = config.getDepcheckOptionsForFolder('any-folder');

      expect(options.ignorePatterns).toEqual(ignoreFilePatterns);
      expect(options.ignoreMatches).toEqual(ignorePackagePatterns);
    });

    it('should use empty arrays as default for optional fields', () => {
      const testCwd = '/test/directory';
      const config = new RepoConfig({ cwd: testCwd });

      const options = config.getDepcheckOptionsForFolder('any-folder');

      expect(options.ignorePatterns).toEqual([]);
      expect(options.ignoreMatches).toEqual([]);
    });

    it('should resolve relative cwd path to absolute', () => {
      const relativePath = './test';
      const config = new RepoConfig({ cwd: relativePath });

      const folders = config.getFolders();

      expect(folders[0]).toBe(path.resolve(relativePath));
      expect(path.isAbsolute(folders[0])).toBe(true);
    });
  });

  describe('getFolders', () => {
    it('should return array with resolved pwd', () => {
      const testCwd = '/test/directory';
      const config = new RepoConfig({ cwd: testCwd });

      const folders = config.getFolders();

      expect(folders).toEqual([path.resolve(testCwd)]);
    });

    it('should always return absolute path', () => {
      const relativeCwd = '../test';
      const config = new RepoConfig({ cwd: relativeCwd });

      const folders = config.getFolders();

      expect(path.isAbsolute(folders[0])).toBe(true);
    });
  });

  describe('getFolderOptions', () => {
    it('should return Options object with correct structure', () => {
      const testCwd = '/test/directory';
      const config = new RepoConfig({ cwd: testCwd });
      const folder = 'any-folder';

      const options = config.getDepcheckOptionsForFolder(folder);

      expect(options).toHaveProperty('ignoreBinPackage');
      expect(options).toHaveProperty('skipMissing');
      expect(options).toHaveProperty('ignorePatterns');
      expect(options).toHaveProperty('ignoreMatches');
    });

    it('should return ignoreBinPackage as false', () => {
      const testCwd = '/test/directory';
      const config = new RepoConfig({ cwd: testCwd });

      const options = config.getDepcheckOptionsForFolder('any-folder');

      expect(options.ignoreBinPackage).toBe(false);
    });

    it('should return skipMissing as false', () => {
      const testCwd = '/test/directory';
      const config = new RepoConfig({ cwd: testCwd });

      const options = config.getDepcheckOptionsForFolder('any-folder');

      expect(options.skipMissing).toBe(false);
    });

    it('should return empty arrays when optional fields are not provided', () => {
      const testCwd = '/test/directory';
      const config = new RepoConfig({ cwd: testCwd });

      const options = config.getDepcheckOptionsForFolder('any-folder');

      expect(options.ignorePatterns).toEqual([]);
      expect(options.ignoreMatches).toEqual([]);
    });
  });
});
