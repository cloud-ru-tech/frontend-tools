import { Options } from 'depcheck';
import path from 'node:path';

import { RepoEnvType } from '../types';

export class RepoConfig {
  protected pwd: string;
  private ignorePatterns?: string[];
  private ignoreMatches?: string[];

  constructor(env: RepoEnvType) {
    this.pwd = path.resolve(env.cwd);
    this.ignoreMatches = env.ignoreMatches || [];
    this.ignorePatterns = env.ignorePatterns || [];
  }

  public getFolders() {
    return [this.pwd];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getFolderOptions(_folder: string): Options {
    return {
      ignoreBinPackage: false,
      skipMissing: false,
      ignorePatterns: this.ignorePatterns,
      ignoreMatches: this.ignoreMatches,
    };
  }
}
