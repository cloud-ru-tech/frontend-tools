import { Results } from 'depcheck';

import { logDebug, logError, logInfo, logWarn } from '../utils/console';

type Messages = [typeof logDebug | typeof logError | typeof logWarn, number, string][];

export type CheckState = Partial<
  Pick<Results, 'dependencies' | 'missing'> & {
    wrongVersions: { dep: string; version: string; actualVersion: string }[];
    internalAsDev: string[];
  }
>;

export class Report {
  private storage: Record<string, CheckState> = {};

  public add(folder: string, state: CheckState) {
    if (this.storage[folder]) {
      throw new Error(`There is check state in storage already for: ${folder}`);
    }

    this.storage[folder] = state;
  }

  public printResultAndGetExitCode(): 1 | 0 {
    let exitCode: 1 | 0 = 0;

    for (const [
      packageName,
      { dependencies = [], internalAsDev = [], wrongVersions = [], missing = {} },
    ] of Object.entries(this.storage)) {
      const messages: Messages = [[logDebug, 0, `\n${packageName}`]];

      if (wrongVersions.length) {
        messages.push([logWarn, 1, 'wrong version of internal packages:']);
        wrongVersions.forEach(({ dep, version, actualVersion }) =>
          messages.push([logError, 2, `"${dep}" has wrong version "${version}", but need "${actualVersion}".`]),
        );
      }

      if (internalAsDev.length) {
        messages.push([logWarn, 1, 'incorrect usage as dev dep of internal packages:']);
        internalAsDev.forEach(dep => messages.push([logError, 2, dep]));
      }

      if (dependencies.length) {
        messages.push([logWarn, 1, 'unused dependencies:']);
        dependencies.forEach(dep => messages.push([logError, 2, dep]));
      }

      const missingEntities = Object.entries(missing);
      if (missingEntities.length) {
        messages.push([logWarn, 1, 'missing dependencies:']);
        for (const [packageName, files] of missingEntities) {
          messages.push([logError, 2, packageName]);
          for (const file of files) {
            messages.push([logError, 3, file]);
          }
        }
      }

      if (messages.length > 1) {
        exitCode = 1;
        this.printMessages(messages);
      }
    }

    if (exitCode === 0) {
      logInfo('Dependencies have been checked. Everything is ok.');
    }

    return exitCode;
  }

  private printMessages(messages: Messages) {
    for (const [logger, indent, message] of messages) {
      logger(`${'  '.repeat(indent)}${message}`);
    }
  }
}
