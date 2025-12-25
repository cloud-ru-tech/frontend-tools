type BaseEnvType = {
  /**
   * Files matching these patterns will be ignored
   * @see https://github.com/depcheck/depcheck?tab=readme-ov-file#api
   * @default '["stories", "dist", "__tests__", "__e2e__"]'
   * @example
   * {
   *    "ignoreFilePatterns": ["dist", "stories/**"]
   * }
   */
  ignoreFilePatterns?: string[];
  /**
   * Ignore dependencies that matches these globs
   * @see https://github.com/depcheck/depcheck?tab=readme-ov-file#api
   * @example
   * {
   *    "ignorePackagePatterns": ["eslint-*"]
   * }
   */
  ignorePackagePatterns?: string[];
};

export type RawRepoEnvType = BaseEnvType & { packages?: Record<string, BaseEnvType> };

export type RawMonorepoEnvType = {
  /**
   * Folder containing packages (glob pattern, e.g., "packages/*" or "apps/*")
   * @default "packages/"
   */
  rootPackagesFolderPattern?: string;
  /**
   * One or more paths that should be ignored in packages folder
   */
  ignoredPackagesFolderFiles?: string[];
} & RawRepoEnvType;

type CommonEnvType<T> = T & {
  /**
   * Current working directory
   */
  cwd: string;
};

export type RepoEnvType = CommonEnvType<RawRepoEnvType>;

export type MonorepoEnvType = CommonEnvType<
  RawMonorepoEnvType & {
    rootPackagesFolderPattern: string;
  }
>;
