import depcheck from 'depcheck';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MonorepoChecker } from '../src/Checker/MonorepoChecker';
import { MonorepoConfig } from '../src/Config/MonorepoConfig';
import { CheckState } from '../src/Report';
import { readPackageJsonFile, readPackageJsonFileSync } from '../src/utils/readPackageJsonFile';

vi.mock('depcheck', () => ({
  default: vi.fn(),
}));

vi.mock('../src/utils/readPackageJsonFile', () => ({
  readPackageJsonFile: vi.fn(),
  readPackageJsonFileSync: vi.fn(),
}));

describe('MonorepoChecker', () => {
  let mockConfig: MonorepoConfig;
  const mockDepcheck = vi.mocked(depcheck);
  const mockReadPackageJsonFile = vi.mocked(readPackageJsonFile);
  const mockReadPackageJsonFileSync = vi.mocked(readPackageJsonFileSync);

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
      getFolders: vi.fn(),
      getDepcheckOptionsForFolder: vi.fn(),
    } as unknown as MonorepoConfig;
  });

  describe('check', () => {
    beforeEach(() => {
      vi.mocked(mockConfig.getFolders).mockReturnValue([]);
    });

    it('should add wrongVersions when dependency version does not match', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync.mockReturnValue({
        name: '@test/package1',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      });
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile.mockResolvedValue({
        name: 'test-package',
        version: '1.0.0',
        dependencies: { '@test/package1': '1.1.0' },
        devDependencies: {},
      });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(1);
      expect(report['storage']['/test/folder1'].wrongVersions).toEqual([
        { dep: '@test/package1', version: '1.1.0', actualVersion: '1.0.0' },
      ]);
    });

    it('should not add wrongVersions when dependency version matches', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync.mockReturnValue({
        name: '@test/package1',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      });
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile.mockResolvedValue({
        name: 'test-package',
        version: '1.0.0',
        dependencies: { '@test/package1': '1.0.0' },
        devDependencies: {},
      });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(0);
    });

    it('should add to existing wrongVersions array', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync.mockReturnValue({
        name: '@test/package1',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      });
      const checkState: CheckState = {
        dependencies: [],
        wrongVersions: [{ dep: 'existing-package', version: '1.0.0', actualVersion: '2.0.0' }],
      };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile.mockResolvedValue({
        name: 'test-package',
        version: '1.0.0',
        dependencies: { '@test/package1': '1.1.0' },
        devDependencies: {},
      });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(1);
      expect(report['storage']['/test/folder1'].wrongVersions).toEqual([
        { dep: 'existing-package', version: '1.0.0', actualVersion: '2.0.0' },
        { dep: '@test/package1', version: '1.1.0', actualVersion: '1.0.0' },
      ]);
    });

    it('should add internalAsDev when internal package is in devDependencies', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync.mockReturnValue({
        name: '@test/package1',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      });
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile.mockResolvedValue({
        name: 'test-package',
        version: '1.0.0',
        dependencies: {},
        devDependencies: { '@test/package1': '1.0.0' },
      });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(1);
      expect(report['storage']['/test/folder1'].internalAsDev).toEqual(['@test/package1']);
    });

    it('should not add internalAsDev when package is not internal', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync.mockReturnValue({
        name: '@test/package1',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      });
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile.mockResolvedValue({
        name: 'test-package',
        version: '1.0.0',
        dependencies: {},
        devDependencies: { 'external-package': '1.0.0' },
      });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(0);
    });

    it('should add to existing internalAsDev array', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync.mockReturnValue({
        name: '@test/package1',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      });
      const checkState: CheckState = {
        dependencies: [],
        internalAsDev: ['existing-package'],
      };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile.mockResolvedValue({
        name: 'test-package',
        version: '1.0.0',
        dependencies: {},
        devDependencies: { '@test/package1': '1.0.0' },
      });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(1);
      expect(report['storage']['/test/folder1'].internalAsDev).toEqual(['existing-package', '@test/package1']);
    });

    it('should handle multiple wrong versions', async () => {
      const folders = ['/test/folder1', '/test/folder2'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync
        .mockReturnValueOnce({
          name: '@test/package1',
          version: '1.0.0',
          dependencies: {},
          devDependencies: {},
        })
        .mockReturnValueOnce({
          name: '@test/package2',
          version: '2.0.0',
          dependencies: {},
          devDependencies: {},
        });
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile
        .mockResolvedValueOnce({
          name: 'test-package',
          version: '1.0.0',
          dependencies: {
            '@test/package1': '1.1.0',
            '@test/package2': '2.1.0',
          },
          devDependencies: {},
        })
        .mockResolvedValueOnce({
          name: 'test-package2',
          version: '1.0.0',
          dependencies: {},
          devDependencies: {},
        });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(1);
      expect(report['storage']['/test/folder1'].wrongVersions).toEqual([
        { dep: '@test/package1', version: '1.1.0', actualVersion: '1.0.0' },
        { dep: '@test/package2', version: '2.1.0', actualVersion: '2.0.0' },
      ]);
    });

    it('should handle both wrongVersions and internalAsDev', async () => {
      const folders = ['/test/folder1', '/test/folder2'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync
        .mockReturnValueOnce({
          name: '@test/package1',
          version: '1.0.0',
          dependencies: {},
          devDependencies: {},
        })
        .mockReturnValueOnce({
          name: '@test/package2',
          version: '2.0.0',
          dependencies: {},
          devDependencies: {},
        });
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile
        .mockResolvedValueOnce({
          name: 'test-package',
          version: '1.0.0',
          dependencies: { '@test/package1': '1.1.0' },
          devDependencies: { '@test/package2': '2.0.0' },
        })
        .mockResolvedValueOnce({
          name: 'test-package2',
          version: '1.0.0',
          dependencies: {},
          devDependencies: {},
        });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(1);
      expect(report['storage']['/test/folder1'].wrongVersions).toEqual([
        { dep: '@test/package1', version: '1.1.0', actualVersion: '1.0.0' },
      ]);
      expect(report['storage']['/test/folder1'].internalAsDev).toEqual(['@test/package2']);
    });

    it('should not add wrongVersions for external packages', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync.mockReturnValue({
        name: '@test/package1',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      });
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile.mockResolvedValue({
        name: 'test-package',
        version: '1.0.0',
        dependencies: { 'external-package': '1.0.0' },
        devDependencies: {},
      });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(0);
    });

    it('should handle empty dependencies and devDependencies', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      mockReadPackageJsonFileSync.mockReturnValue({
        name: '@test/package1',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      });
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);
      mockReadPackageJsonFile.mockResolvedValue({
        name: 'test-package',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      });
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new MonorepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(0);
    });
  });
});
