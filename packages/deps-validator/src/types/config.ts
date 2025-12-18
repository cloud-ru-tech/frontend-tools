export type Config = {
  /**  Directories names that should be ignored */
  ignorePatterns?: string[];
  /**  Names of packages that should be ignored */
  ignoreMatches?: string[];
  /** Monorepo prefix (if skipped will try to find automatically) */
  prefix?: string;
  /** One or more paths that should be ignored in packages folder */
  ignoredPackagesFolderFiles?: string[];
  /** Folder containing packages (glob pattern, e.g., "packages/*" or "apps/*") */
  rootPackagesFolderPattern?: string;
};
