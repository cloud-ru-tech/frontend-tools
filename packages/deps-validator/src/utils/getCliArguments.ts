import path from 'path';

import yargs from 'yargs';

export function getCliArguments() {
  const parsed = yargs(process.argv.slice(2))
    .option('cwd', {
      alias: 'd',
      type: 'string',
      default: process.cwd(),
      description: 'working directory (default: current working directory, cwd)',
    })
    .option('prefix', {
      type: 'string',
      description: 'monorepo prefix (if skipped will try to find automatically)',
    })
    .option('rootPackagesFolderPattern', {
      alias: 'p',
      type: 'string',
      default: 'packages/*',
      description: 'folder containing packages (glob pattern, e.g., "packages/*" or "apps/*")',
    })
    .option('ignoredPackagesFolderFiles', {
      type: 'array',
      default: ['packages/tsconfig.cjs.json', 'packages/tsconfig.esm.json'],
      description: 'specify one or more paths that should be ignored in packages folder',
    })
    .option('ignorePatterns', {
      type: 'array',
      default: ['stories', 'dist', '__tests__', '__e2e__'],
      description: 'specify one or more directories names that should be ignored',
    })
    .option('ignoreMatches', {
      type: 'array',
      default: [
        'react',
        'react-dom',
        'react-docgen-typescript',
        '@snack-uikit/figma-tokens',
        '@sbercloud/figma-tokens-cloud-platform',
        '@sbercloud/figma-tokens-mlspace',
        '@sbercloud/figma-tokens-admin',
        '@sbercloud/figma-tokens-web',
        '@sbercloud/figma-tokens-giga-id',
      ],
      description: 'specify one or more packages that should be ignored',
    })
    .locale('en')
    .help()
    .alias('h', 'help')
    .alias('v', 'version')
    .parseSync();

  const cwd = path.resolve(parsed.cwd);

  const rootPackagesFolderPattern = path.resolve(cwd, parsed.rootPackagesFolderPattern);

  const ignoredPackagesFolderFiles = parsed.ignoredPackagesFolderFiles.map(file => path.resolve(cwd, file.toString()));

  return {
    ...parsed,
    cwd,
    rootPackagesFolderPattern,
    ignoredPackagesFolderFiles,
  };
}
