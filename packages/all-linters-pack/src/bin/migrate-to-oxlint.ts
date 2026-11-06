#!/usr/bin/env node

import path from 'path';

import { migrateToOxlint } from '../oxlint-migration';

const USAGE = `Usage: migrate-to-oxlint [--dry-run] [--cwd=<path>]

Migrates the project from ESLint (@cloud-ru/eslint-config) to Oxlint (@cloud-ru/ft-config-oxlint).`;

function parseCli(argv: string[]): { cwd: string; dryRun: boolean } {
  const dryRun = argv.includes('--dry-run');
  const cwdArg = argv.find(arg => arg.startsWith('--cwd='));
  const unknown = argv.filter(arg => arg !== '--dry-run' && !arg.startsWith('--cwd='));
  if (unknown.length > 0) {
    throw new Error(`Unknown arguments: ${unknown.join(' ')}\n\n${USAGE}`);
  }
  return { cwd: cwdArg ? path.resolve(cwdArg.slice('--cwd='.length)) : process.cwd(), dryRun };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.includes('-h') || argv.includes('--help')) {
    console.info(USAGE);
    return;
  }

  const { cwd, dryRun } = parseCli(argv);
  const { changes, warnings } = await migrateToOxlint({ cwd, dryRun });

  console.info(dryRun ? 'migrate-to-oxlint (dry run), would:' : 'migrate-to-oxlint:');
  changes.forEach(change => console.info(`  ✔ ${change}`));
  warnings.forEach(warning => console.warn(`  ⚠ ${warning}`));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
