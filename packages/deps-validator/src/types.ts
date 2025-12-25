type BaseEnvType = {
  /**  Directories names that should be ignored */
  ignorePatterns?: string[];
  /**  Names of packages that should be ignored */
  ignoreMatches?: string[];
};

export type RawRepoEnvType = BaseEnvType & { packages?: Record<string, BaseEnvType> };

export type RawMonorepoEnvType = {
  /** One or more paths that should be ignored in packages folder */
  ignoredPackagesFolderFiles?: string[];
  /** Folder containing packages (glob pattern, e.g., "packages/*" or "apps/*") */
  rootPackagesFolderPattern?: string;
} & RawRepoEnvType;

export type RepoEnvType = RawRepoEnvType & {
  cwd: string;
};

export type MonorepoEnvType = RawMonorepoEnvType & {
  cwd: string;
  rootPackagesFolderPattern: string;
};
