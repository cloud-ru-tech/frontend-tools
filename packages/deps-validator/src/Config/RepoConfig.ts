import { Options } from 'depcheck';
import path from 'node:path';

import { RepoEnvType } from '../types';

export class RepoConfig {
  protected pwd: string;
  private ignoreFilePatterns?: string[];
  private ignorePackagePatterns?: string[];

  constructor(env: RepoEnvType) {
    this.pwd = path.resolve(env.cwd);
    this.ignorePackagePatterns = env.ignorePackagePatterns || [];
    this.ignoreFilePatterns = env.ignoreFilePatterns || [];
  }

  public getFolders() {
    return [this.pwd];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getDepcheckOptionsForFolder(_folder: string): Options {
    return {
      ignoreBinPackage: false,
      skipMissing: false,
      ignorePatterns: this.ignoreFilePatterns,
      ignoreMatches: this.ignorePackagePatterns,
    };
  }
}
