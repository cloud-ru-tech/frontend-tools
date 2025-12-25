import { Options } from 'depcheck';
import { globSync } from 'glob';
import path from 'node:path';

import { MonorepoEnvType } from '../types';
import { RepoConfig } from './RepoConfig';

export class MonorepoConfig extends RepoConfig {
  private rootPackagesFolderPattern: string;
  private ignoredPackagesFolderFiles: string[];
  private packages: Exclude<MonorepoEnvType['packages'], undefined>;
  private folders?: string[];

  constructor(env: MonorepoEnvType) {
    super(env);
    this.rootPackagesFolderPattern = env.rootPackagesFolderPattern;
    this.ignoredPackagesFolderFiles = env.ignoredPackagesFolderFiles || [];
    this.packages = env.packages || {};
  }

  public getDepcheckOptionsForFolder(folderPath: string): Options {
    const options = super.getDepcheckOptionsForFolder(folderPath);

    const folder = path.basename(folderPath);

    const folderIgnores = this.packages[folder];

    if (!folderIgnores) {
      return options;
    }

    if (folderIgnores.ignoreFilePatterns?.length) {
      options.ignorePatterns = [...(options.ignorePatterns || []), ...folderIgnores.ignoreFilePatterns];
    }
    if (folderIgnores.ignorePackagePatterns?.length) {
      options.ignoreMatches = [...(options.ignoreMatches || []), ...folderIgnores.ignorePackagePatterns];
    }

    return options;
  }

  public getFolders(): string[] {
    if (!this.folders) {
      this.folders = globSync(this.rootPackagesFolderPattern, {
        ignore: this.ignoredPackagesFolderFiles,
      });
    }

    return this.folders.map(folder => path.resolve(this.pwd, folder));
  }
}
