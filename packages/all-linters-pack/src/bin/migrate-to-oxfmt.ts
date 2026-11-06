#!/usr/bin/env node

import path from 'path';

import { migrateToOxfmt } from '../oxfmt-migration';

function parseCli(argv: string[]): { cwd: string; dryRun: boolean } {
  if (argv.includes('-h') || argv.includes('--help')) {
    process.exit(0);
  }

  const dryRun = argv.includes('--dry-run');
  const cwdArg = argv.find(arg => arg.startsWith('--cwd='));
  const cwd = cwdArg ? path.resolve(cwdArg.slice('--cwd='.length)) : process.cwd();

  const unknown = argv.filter(arg => arg !== '--dry-run' && !arg.startsWith('--cwd='));
  if (unknown.length > 0) {
    throw new Error(`Unknown arguments: ${unknown.join(' ')}`);
  }

  return { cwd, dryRun };
}

function main(): void {
  try {
    const { cwd, dryRun } = parseCli(process.argv.slice(2));
    const { warnings } = migrateToOxfmt({ cwd, dryRun });
    warnings.forEach(message => console.warn(`warn: ${message}`));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
