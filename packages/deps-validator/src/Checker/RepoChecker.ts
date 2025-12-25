import depcheck from 'depcheck';

import { RepoConfig } from '../Config';
import { CheckState, Report } from '../Report';

export class RepoChecker {
  protected config: RepoConfig;

  constructor(config: RepoConfig) {
    this.config = config;
  }

  public async check(): Promise<Report> {
    const folders = this.config.getFolders();
    const report = new Report();
    await Promise.all(folders.map(folder => this.checkFolder(folder).then(result => report.add(folder, result))));
    return report;
  }

  protected async checkFolder(path: string): Promise<CheckState> {
    return depcheck(path, this.config.getDepcheckOptionsForFolder(path));
  }
}
