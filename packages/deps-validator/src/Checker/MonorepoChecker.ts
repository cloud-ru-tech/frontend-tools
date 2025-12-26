import { MonorepoConfig } from '../Config';
import { readPackageJsonFile, readPackageJsonFileSync } from '../utils/readPackageJsonFile';
import { RepoChecker } from './RepoChecker';

export class MonorepoChecker extends RepoChecker {
  private actualVersions: Record<string, string> = {};

  constructor(config: MonorepoConfig) {
    super(config);

    this.actualVersions = this.config.getFolders().reduce((acc, folder) => {
      const pkg = readPackageJsonFileSync(folder);
      acc[pkg.name] = pkg.version;
      return acc;
    }, this.actualVersions);
  }

  protected async checkFolder(path: string) {
    const [result, pkg] = await Promise.all([super.checkFolder(path), readPackageJsonFile(path)]);

    if (pkg.dependencies) {
      for (const [dep, version] of Object.entries(pkg.dependencies)) {
        const actualVersion = this.actualVersions[dep];
        if (actualVersion && actualVersion !== version) {
          const message = `"${dep}" has wrong version "${version}", but need "${actualVersion}".`;
          if (result.wrongVersions) {
            result.wrongVersions.push(message);
          } else {
            result.wrongVersions = [message];
          }
        }
      }
    }

    if (pkg.devDependencies) {
      for (const devDep of Object.keys(pkg.devDependencies)) {
        if (this.actualVersions[devDep]) {
          if (result.internalAsDev) {
            result.internalAsDev.push(devDep);
          } else {
            result.internalAsDev = [devDep];
          }
        }
      }
    }

    return result;
  }
}
