import { beforeEach, describe, expect, it, vi } from 'vitest';

import { logDebug, logError, logInfo, logWarn } from '../../utils/console';
import { Report } from '../index';

vi.mock('../../utils/console', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

describe('Report', () => {
  let report: Report;

  beforeEach(() => {
    report = new Report();
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('should add state to storage', () => {
      const folder = 'packages/test-package';
      const state = {
        dependencies: ['unused-dep'],
        wrongVersions: ['@cloud-ru/package'],
      };

      report.add(folder, state);

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(1);
      expect(logDebug).toHaveBeenCalled();
      expect(logWarn).toHaveBeenCalled();
      expect(logError).toHaveBeenCalled();
    });

    it('should throw error when trying to add state for existing folder', () => {
      const folder = 'packages/test-package';
      const firstState = {
        dependencies: ['unused-dep'],
      };
      const secondState = {
        wrongVersions: ['@cloud-ru/package'],
      };

      report.add(folder, firstState);

      expect(() => {
        report.add(folder, secondState);
      }).toThrow(`There is check state in storage already for: ${folder}`);
    });
  });

  describe('printResultAndGetExitCode', () => {
    it('should return 0 when storage is empty', () => {
      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(0);
      expect(logDebug).not.toHaveBeenCalled();
      expect(logWarn).not.toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
      expect(logInfo).toHaveBeenCalledWith('Dependencies have been checked. Everything is ok.');
    });

    it('should return 0 when there are no errors', () => {
      report.add('packages/test-package', {
        dependencies: [],
        wrongVersions: [],
        internalAsDev: [],
        missing: {},
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(0);
      expect(logDebug).not.toHaveBeenCalled();
      expect(logWarn).not.toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
      expect(logInfo).toHaveBeenCalledWith('Dependencies have been checked. Everything is ok.');
    });

    it('should return 1 and log errors when wrongVersions exist', () => {
      const folder = 'packages/test-package';
      const wrongVersions = ['@cloud-ru/package1', '@cloud-ru/package2'];

      report.add(folder, {
        wrongVersions,
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(logDebug).toHaveBeenCalledWith(`\n${folder}`);
      expect(logWarn).toHaveBeenCalledWith('  wrong version of internal packages:');
      expect(logError).toHaveBeenCalledWith('    @cloud-ru/package1');
      expect(logError).toHaveBeenCalledWith('    @cloud-ru/package2');
    });

    it('should return 1 and log errors when internalAsDev exist', () => {
      const folder = 'packages/test-package';
      const internalAsDev = ['@cloud-ru/package1', '@cloud-ru/package2'];

      report.add(folder, {
        internalAsDev,
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(logDebug).toHaveBeenCalledWith(`\n${folder}`);
      expect(logWarn).toHaveBeenCalledWith('  incorrect usage as dev dep of internal packages:');
      expect(logError).toHaveBeenCalledWith('    @cloud-ru/package1');
      expect(logError).toHaveBeenCalledWith('    @cloud-ru/package2');
    });

    it('should return 1 and log errors when dependencies exist', () => {
      const folder = 'packages/test-package';
      const dependencies = ['unused-dep1', 'unused-dep2'];

      report.add(folder, {
        dependencies,
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(logDebug).toHaveBeenCalledWith(`\n${folder}`);
      expect(logWarn).toHaveBeenCalledWith('  unused dependencies:');
      expect(logError).toHaveBeenCalledWith('    unused-dep1');
      expect(logError).toHaveBeenCalledWith('    unused-dep2');
    });

    it('should return 1 and log errors when missing dependencies exist', () => {
      const folder = 'packages/test-package';
      const missing = {
        'missing-package1': ['file1.ts', 'file2.ts'],
        'missing-package2': ['file3.ts'],
      };

      report.add(folder, {
        missing,
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(logDebug).toHaveBeenCalledWith(`\n${folder}`);
      expect(logWarn).toHaveBeenCalledWith('  missing dependencies:');
      expect(logError).toHaveBeenCalledWith('    missing-package1');
      expect(logError).toHaveBeenCalledWith('      file1.ts');
      expect(logError).toHaveBeenCalledWith('      file2.ts');
      expect(logError).toHaveBeenCalledWith('    missing-package2');
      expect(logError).toHaveBeenCalledWith('      file3.ts');
    });

    it('should handle all error types together', () => {
      const folder = 'packages/test-package';

      report.add(folder, {
        wrongVersions: ['@cloud-ru/package1'],
        internalAsDev: ['@cloud-ru/package2'],
        dependencies: ['unused-dep'],
        missing: {
          'missing-package': ['file.ts'],
        },
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(logDebug).toHaveBeenCalledWith(`\n${folder}`);
      expect(logWarn).toHaveBeenCalledWith('  wrong version of internal packages:');
      expect(logError).toHaveBeenCalledWith('    @cloud-ru/package1');
      expect(logWarn).toHaveBeenCalledWith('  incorrect usage as dev dep of internal packages:');
      expect(logError).toHaveBeenCalledWith('    @cloud-ru/package2');
      expect(logWarn).toHaveBeenCalledWith('  unused dependencies:');
      expect(logError).toHaveBeenCalledWith('    unused-dep');
      expect(logWarn).toHaveBeenCalledWith('  missing dependencies:');
      expect(logError).toHaveBeenCalledWith('    missing-package');
      expect(logError).toHaveBeenCalledWith('      file.ts');
    });

    it('should process multiple packages', () => {
      report.add('packages/package1', {
        wrongVersions: ['@cloud-ru/package'],
      });

      report.add('packages/package2', {
        dependencies: ['unused-dep'],
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(logDebug).toHaveBeenCalledWith('\npackages/package1');
      expect(logWarn).toHaveBeenCalledWith(expect.stringContaining('wrong version'));
      expect(logDebug).toHaveBeenCalledWith('\npackages/package2');
      expect(logWarn).toHaveBeenCalledWith(expect.stringContaining('unused dependencies'));
    });

    it('should use default values for undefined fields', () => {
      const folder = 'packages/test-package';

      report.add(folder, {});

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(0);
      expect(logDebug).not.toHaveBeenCalled();
      expect(logWarn).not.toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
      expect(logInfo).toHaveBeenCalledWith('Dependencies have been checked. Everything is ok.');
    });

    it('should format messages with correct spaces', () => {
      const folder = 'packages/test-package';

      report.add(folder, {
        wrongVersions: ['@cloud-ru/package'],
      });

      report.printResultAndGetExitCode();

      expect(logDebug).toHaveBeenCalledWith(`\n${folder}`);
      expect(logWarn).toHaveBeenCalledWith('  wrong version of internal packages:');
      expect(logError).toHaveBeenCalledWith('    @cloud-ru/package');
    });
  });
});
