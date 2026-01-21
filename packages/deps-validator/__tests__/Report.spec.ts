import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Report } from '../src/Report/index';
import * as console from '../src/utils/console';

vi.mock('../src/utils/console', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

describe('Report', () => {
  let report: Report;
  let output: string[] = [];

  const consoleMock = vi.mocked(console);

  consoleMock.logDebug.mockImplementation(message => output.push(`[debug] ${message}`));
  consoleMock.logError.mockImplementation(message => output.push(`[error] ${message}`));
  consoleMock.logInfo.mockImplementation(message => output.push(`[info] ${message}`));
  consoleMock.logWarn.mockImplementation(message => output.push(`[warn] ${message}`));

  beforeEach(() => {
    output = [];
    report = new Report();
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('should add state to storage', () => {
      const folder = 'packages/test-package';
      const state = {
        dependencies: ['unused-dep'],
        wrongVersions: [{ dep: '@cloud-ru/package', version: '1.0.0', actualVersion: '2.0.0' }],
      };

      report.add(folder, state);

      const exitCode = report.printResultAndGetExitCode();
      expect(exitCode).toBe(1);
      expect(output).toMatchSnapshot();
    });

    it('should throw error when trying to add state for existing folder', () => {
      const folder = 'packages/test-package';
      const firstState = {
        dependencies: ['unused-dep'],
      };
      const secondState = {
        wrongVersions: [{ dep: '@cloud-ru/package', version: '1.0.0', actualVersion: '2.0.0' }],
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
      expect(output).toMatchSnapshot();
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
      expect(output).toMatchSnapshot();
    });

    it('should return 1 and log errors when wrongVersions exist', () => {
      const folder = 'packages/test-package';
      const wrongVersions = [
        { dep: '@cloud-ru/package1', version: '1.0.0', actualVersion: '2.0.0' },
        { dep: '@cloud-ru/package2', version: '1.5.0', actualVersion: '2.1.0' },
      ];

      report.add(folder, {
        wrongVersions,
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(output).toMatchSnapshot();
    });

    it('should return 1 and log errors when internalAsDev exist', () => {
      const folder = 'packages/test-package';
      const internalAsDev = ['@cloud-ru/package1', '@cloud-ru/package2'];

      report.add(folder, {
        internalAsDev,
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(output).toMatchSnapshot();
    });

    it('should return 1 and log errors when dependencies exist', () => {
      const folder = 'packages/test-package';
      const dependencies = ['unused-dep1', 'unused-dep2'];

      report.add(folder, {
        dependencies,
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(output).toMatchSnapshot();
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
      expect(output).toMatchSnapshot();
    });

    it('should handle all error types together', () => {
      const folder = 'packages/test-package';

      report.add(folder, {
        wrongVersions: [{ dep: '@cloud-ru/package1', version: '1.0.0', actualVersion: '2.0.0' }],
        internalAsDev: ['@cloud-ru/package2'],
        dependencies: ['unused-dep'],
        missing: {
          'missing-package': ['file.ts'],
        },
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(output).toMatchSnapshot();
    });

    it('should process multiple packages', () => {
      report.add('packages/package1', {
        wrongVersions: [{ dep: '@cloud-ru/package', version: '1.0.0', actualVersion: '2.0.0' }],
      });

      report.add('packages/package2', {
        dependencies: ['unused-dep'],
      });

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(1);
      expect(output).toMatchSnapshot();
    });

    it('should use default values for undefined fields', () => {
      const folder = 'packages/test-package';

      report.add(folder, {});

      const exitCode = report.printResultAndGetExitCode();

      expect(exitCode).toBe(0);
      expect(output).toMatchSnapshot();
    });
  });
});
