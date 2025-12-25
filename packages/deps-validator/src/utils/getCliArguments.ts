import yargs from 'yargs';

export function getCliArguments() {
  return yargs(process.argv.slice(2))
    .option('cwd', {
      alias: 'd',
      type: 'string',
      description: 'working directory (default: current working directory, cwd)',
    })
    .option('rootPackagesFolderPattern', {
      alias: 'p',
      type: 'string',
      description: 'folder containing packages (glob pattern, e.g., "packages/*" or "apps/*")',
    })
    .option('ignoredPackagesFolderFiles', {
      type: 'array',
      description: 'specify one or more paths that should be ignored in packages folder',
    })
    .option('ignoreFilePatterns', {
      type: 'array',
      description: 'specify one or more directories names that should be ignored',
    })
    .option('ignorePackagePatterns', {
      type: 'array',
      description: 'specify one or more packages that should be ignored',
    })
    .locale('en')
    .help()
    .alias('h', 'help')
    .alias('v', 'version')
    .parseSync();
}
