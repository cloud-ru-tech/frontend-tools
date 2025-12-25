import depcheck from 'depcheck';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RepoConfig } from '../../Config/RepoConfig';
import { CheckState } from '../../Report';
import { RepoChecker } from '../RepoChecker';

vi.mock('depcheck', () => ({
  default: vi.fn(),
}));

describe('RepoChecker', () => {
  let mockConfig: RepoConfig;
  const mockDepcheck = vi.mocked(depcheck);

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
      getFolders: vi.fn(),
      getDepcheckOptionsForFolder: vi.fn(),
    } as unknown as RepoConfig;
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      const checker = new RepoChecker(mockConfig);

      expect(checker).toBeInstanceOf(RepoChecker);
    });
  });

  describe('check', () => {
    it('should call getFolders on config', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);

      const checker = new RepoChecker(mockConfig);
      await checker.check();

      expect(mockConfig.getFolders).toHaveBeenCalledTimes(1);
    });

    it('should call checkFolder for each folder', async () => {
      const folders = ['/test/folder1', '/test/folder2'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      const checkState1: CheckState = { dependencies: ['dep1'] };
      const checkState2: CheckState = { dependencies: ['dep2'] };
      mockDepcheck.mockResolvedValueOnce(checkState1).mockResolvedValueOnce(checkState2);
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({} as never);

      const checker = new RepoChecker(mockConfig);
      await checker.check();

      expect(mockDepcheck).toHaveBeenCalledTimes(2);
    });

    it('should call getDepcheckOptionsForFolder for each folder with correct path', async () => {
      const folders = ['/test/folder1', '/test/folder2'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      const options1 = { ignoreBinPackage: false };
      const options2 = { ignoreBinPackage: false };
      vi.mocked(mockConfig.getDepcheckOptionsForFolder)
        .mockReturnValueOnce(options1 as never)
        .mockReturnValueOnce(options2 as never);
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);

      const checker = new RepoChecker(mockConfig);
      await checker.check();

      expect(mockConfig.getDepcheckOptionsForFolder).toHaveBeenCalledWith('/test/folder1');
      expect(mockConfig.getDepcheckOptionsForFolder).toHaveBeenCalledWith('/test/folder2');
    });

    it('should call depcheck with correct path and options', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      const options = { ignoreBinPackage: false, skipMissing: false };
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue(options as never);
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);

      const checker = new RepoChecker(mockConfig);
      await checker.check();

      expect(mockDepcheck).toHaveBeenCalledWith('/test/folder1', options);
    });

    it('should add results to report for each folder', async () => {
      const folders = ['/test/folder1', '/test/folder2'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      const checkState1: CheckState = { dependencies: ['dep1'] };
      const checkState2: CheckState = { dependencies: ['dep2'] };
      mockDepcheck.mockResolvedValueOnce(checkState1).mockResolvedValueOnce(checkState2);
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({} as never);

      const checker = new RepoChecker(mockConfig);
      const report = await checker.check();

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(1);
    });

    it('should return Report instance', async () => {
      const folders = ['/test/folder1'];
      vi.mocked(mockConfig.getFolders).mockReturnValue(folders);
      const checkState: CheckState = { dependencies: [] };
      mockDepcheck.mockResolvedValue(checkState);
      vi.mocked(mockConfig.getDepcheckOptionsForFolder).mockReturnValue({});

      const checker = new RepoChecker(mockConfig);
      const report = await checker.check();

      expect(report).toBeDefined();
      expect(report.printResultAndGetExitCode).toBeDefined();
    });

    it('should handle empty folders array', async () => {
      vi.mocked(mockConfig.getFolders).mockReturnValue([]);

      const checker = new RepoChecker(mockConfig);
      const report = await checker.check();

      expect(mockDepcheck).not.toHaveBeenCalled();
      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(0);
    });
  });
});
