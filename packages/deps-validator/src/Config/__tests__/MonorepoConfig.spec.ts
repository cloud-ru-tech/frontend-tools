import { globSync } from 'glob';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MonorepoConfig } from '../MonorepoConfig';

vi.mock('glob', () => ({
  globSync: vi.fn(),
}));

describe('MonorepoConfig', () => {
  const mockGlobSync = vi.mocked(globSync);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with required fields', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      mockGlobSync.mockReturnValueOnce(['packages/package1']);
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
      });

      expect(config.getFolders()).toBeDefined();
    });

    it('should use empty array as default for ignoredPackagesFolderFiles', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
      });

      mockGlobSync.mockReturnValueOnce(['packages/package1']);
      config.getFolders();

      expect(mockGlobSync).toHaveBeenCalledWith(rootPackagesFolderPattern, {
        ignore: [],
      });
    });

    it('should initialize with packages', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const packages = {
        package1: {
          ignoreFilePatterns: ['dist'],
          ignorePackagePatterns: ['@cloud-ru/test'],
        },
      };
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        packages,
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options.ignorePatterns).toContain('dist');
      expect(options.ignoreMatches).toContain('@cloud-ru/test');
    });

    it('should use empty object as default for packages', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options).toEqual({
        ignoreBinPackage: false,
        skipMissing: false,
        ignorePatterns: [],
        ignoreMatches: [],
      });
    });

    it('should call parent constructor with cwd', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
      });

      mockGlobSync.mockReturnValueOnce(['packages/package1']);
      const folders = config.getFolders();

      expect(mockGlobSync).toHaveBeenCalled();
      expect(folders).toEqual([path.resolve(testCwd, 'packages/package1')]);
    });
  });

  describe('getFolders', () => {
    it('should return folders from globSync', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const mockFolders = ['packages/package1', 'packages/package2'];
      mockGlobSync.mockReturnValueOnce(mockFolders);

      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
      });

      const folders = config.getFolders();

      expect(folders).toEqual([path.resolve(testCwd, 'packages/package1'), path.resolve(testCwd, 'packages/package2')]);
      expect(mockGlobSync).toHaveBeenCalledWith(rootPackagesFolderPattern, {
        ignore: [],
      });
    });

    it('should use ignoredPackagesFolderFiles in globSync', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const ignoredPackagesFolderFiles = ['file1.json'];
      const mockFolders = ['packages/package1'];
      mockGlobSync.mockReturnValueOnce(mockFolders);

      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        ignoredPackagesFolderFiles,
      });

      const folders = config.getFolders();

      expect(folders).toEqual([path.resolve(testCwd, 'packages/package1')]);
      expect(mockGlobSync).toHaveBeenCalledWith(rootPackagesFolderPattern, {
        ignore: ignoredPackagesFolderFiles,
      });
    });

    it('should cache folders result', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const mockFolders = ['packages/package1'];
      mockGlobSync.mockReturnValueOnce(mockFolders);

      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
      });

      const folders1 = config.getFolders();
      const folders2 = config.getFolders();

      const expectedFolders = [path.resolve(testCwd, 'packages/package1')];
      expect(folders1).toEqual(expectedFolders);
      expect(folders2).toEqual(expectedFolders);
      expect(mockGlobSync).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFolderOptions', () => {
    it('should return Options object with correct structure', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options).toHaveProperty('ignoreBinPackage');
      expect(options).toHaveProperty('skipMissing');
      expect(options).toHaveProperty('ignorePatterns');
      expect(options).toHaveProperty('ignoreMatches');
    });

    it('should merge ignoreFilePatterns from parent and package config', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const parentignoreFilePatterns = ['dist', 'node_modules'];
      const packageignoreFilePatterns = ['build', 'coverage'];
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        ignoreFilePatterns: parentignoreFilePatterns,
        packages: {
          package1: {
            ignoreFilePatterns: packageignoreFilePatterns,
          },
        },
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options.ignorePatterns).toEqual([...parentignoreFilePatterns, ...packageignoreFilePatterns]);
    });

    it('should merge ignorePackagePatterns from parent and package config', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const parentIgnorePackagePatterns = ['@cloud-ru/package1'];
      const packageIgnorePackagePatterns = ['@cloud-ru/package2'];
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        ignorePackagePatterns: parentIgnorePackagePatterns,
        packages: {
          package1: {
            ignorePackagePatterns: packageIgnorePackagePatterns,
          },
        },
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options.ignoreMatches).toEqual([...parentIgnorePackagePatterns, ...packageIgnorePackagePatterns]);
    });

    it('should merge both ignoreFilePatterns and ignorePackagePatterns from package config', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const parentignoreFilePatterns = ['dist'];
      const parentignorePackagePatterns = ['@cloud-ru/package1'];
      const packageignoreFilePatterns = ['build'];
      const packageignorePackagePatterns = ['@cloud-ru/package2'];
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        ignoreFilePatterns: parentignoreFilePatterns,
        ignorePackagePatterns: parentignorePackagePatterns,
        packages: {
          package1: {
            ignoreFilePatterns: packageignoreFilePatterns,
            ignorePackagePatterns: packageignorePackagePatterns,
          },
        },
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options.ignorePatterns).toEqual([...parentignoreFilePatterns, ...packageignoreFilePatterns]);
      expect(options.ignoreMatches).toEqual([...parentignorePackagePatterns, ...packageignorePackagePatterns]);
    });

    it('should use only parent options when package config is not provided', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const parentignoreFilePatterns = ['dist'];
      const parentignorePackagePatterns = ['@cloud-ru/package1'];
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        ignoreFilePatterns: parentignoreFilePatterns,
        ignorePackagePatterns: parentignorePackagePatterns,
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options.ignorePatterns).toEqual(parentignoreFilePatterns);
      expect(options.ignoreMatches).toEqual(parentignorePackagePatterns);
    });

    it('should use only parent options when package config does not have ignoreFilePatterns', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const parentignoreFilePatterns = ['dist'];
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        ignoreFilePatterns: parentignoreFilePatterns,
        packages: {
          package1: {
            ignorePackagePatterns: ['@cloud-ru/package2'],
          },
        },
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options.ignorePatterns).toEqual(parentignoreFilePatterns);
    });

    it('should use only parent options when package config does not have ignorePackagePatterns', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const parentignorePackagePatterns = ['@cloud-ru/package1'];
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        ignorePackagePatterns: parentignorePackagePatterns,
        packages: {
          package1: {
            ignoreFilePatterns: ['build'],
          },
        },
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options.ignoreMatches).toEqual(parentignorePackagePatterns);
    });

    it('should use folder name from path to get package config', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        packages: {
          package1: {
            ignoreFilePatterns: ['dist'],
          },
          package2: {
            ignoreFilePatterns: ['build'],
          },
        },
      });

      const options1 = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');
      const options2 = config.getDepcheckOptionsForFolder('/test/directory/packages/package2');

      expect(options1.ignorePatterns).toContain('dist');
      expect(options2.ignorePatterns).toContain('build');
    });

    it('should return parent options when package config is empty', () => {
      const testCwd = '/test/directory';
      const rootPackagesFolderPattern = 'packages/*';
      const parentignoreFilePatterns = ['dist'];
      const config = new MonorepoConfig({
        cwd: testCwd,
        rootPackagesFolderPattern,
        ignoreFilePatterns: parentignoreFilePatterns,
        packages: {
          package1: {},
        },
      });

      const options = config.getDepcheckOptionsForFolder('/test/directory/packages/package1');

      expect(options.ignorePatterns).toEqual(parentignoreFilePatterns);
    });
  });
});
