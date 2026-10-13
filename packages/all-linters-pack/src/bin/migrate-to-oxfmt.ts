#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const MIN_PACK_VERSION = '1.0.17';
const LINTERS_PACK = '@cloud-ru/ft-all-linters-pack';
const OXFMT_CONFIG_PKG = '@cloud-ru/ft-config-oxfmt';

const OXFMT_CONFIG_FILE = 'oxfmt.config.mts';
const LEGACY_OXFMT_CONFIGS = ['oxfmt.config.js', 'oxfmt.config.ts'] as const;

const ESLINT_CANDIDATES = ['eslint.config.mjs', 'eslint.config.js', 'eslint.config.cjs'] as const;
const ESLINT_MONOREPO_OXFMT = '@cloud-ru/eslint-config/monorepo-oxfmt';

const LINT_STAGED_DEFAULT = 'defaultLintStagedConfig';
const LINT_STAGED_OXFMT = 'defaultLintStagedConfigWithOxfmt';
const OXFMT_LINT_STAGED_WRITE = 'oxfmt --write';

const OXC_VSCODE = 'oxc.oxc-vscode';
const OXC_LANGUAGES = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'json', 'jsonc'] as const;

const RE_CLOUD_RU_MONOREPO_IMPORT = /@cloud-ru\/eslint-config\/monorepo(?!-oxfmt)/g;
const RE_LOCAL_MONOREPO_JS = /eslint-config\/monorepo\.js/g;

const RE_PRETTIER_OFF = /['"]prettier\/prettier['"]\s*:\s*(?:['"]off['"]|0)/;
const RE_OXFMT_CONFIG_ESLINT = /['"]oxfmt\.config\.mts['"]/;

const RE_PLAIN_LINT_STAGED = new RegExp(
  `^module\\.exports\\s*=\\s*require\\(['"]${LINTERS_PACK.replace('@', '\\@')}['"]\\)\\.${LINT_STAGED_DEFAULT}\\s*;?\\s*$`,
  'm',
);

const RE_LINT_STAGED_PRESET = new RegExp(
  `(${LINTERS_PACK.replace('@', '\\@')}['"]\\)\\.)${LINT_STAGED_DEFAULT}(?!WithOxfmt)`,
  'g',
);

const MONOREPO_PRETTIER_OFF = `  {
    rules: { 'prettier/prettier': 'off' },
  },`;

type PackageJson = {
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
};

type MigrationProfile = {
  pkg: PackageJson;
  oxfmtConfigImport: string;
  packLintStaged: boolean;
};

type MigrationContext = {
  cwd: string;
  dryRun: boolean;
  warnings: string[];
  write(relativePath: string, content: string): void;
  remove(relativePath: string): void;
  warn(message: string): void;
};

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

function createContext(cwd: string, dryRun: boolean): MigrationContext {
  const warnings: string[] = [];

  const write = (relativePath: string, content: string) => {
    const absolutePath = path.join(cwd, relativePath);
    if (fs.existsSync(absolutePath) && fs.readFileSync(absolutePath, 'utf8') === content) {
      return;
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fs.writeFileSync(absolutePath, content, 'utf8');
    }
  };

  const remove = (relativePath: string) => {
    const absolutePath = path.join(cwd, relativePath);
    if (!fs.existsSync(absolutePath)) return;
    if (!dryRun) fs.unlinkSync(absolutePath);
  };

  return {
    cwd,
    dryRun,
    warnings,
    write,
    remove,
    warn: message => warnings.push(message),
  };
}

function readText(cwd: string, relativePath: string): string {
  return fs.readFileSync(path.join(cwd, relativePath), 'utf8');
}

function readJson(cwd: string, relativePath: string): Record<string, unknown> | undefined {
  const absolutePath = path.join(cwd, relativePath);
  if (!fs.existsSync(absolutePath)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8')) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function firstExistingFile(cwd: string, candidates: readonly string[]): string | undefined {
  return candidates.find(name => fs.existsSync(path.join(cwd, name)));
}

function parseSemver(version: string): number[] {
  return version
    .replace(/^[\^~>=<]+/, '')
    .split('-')[0]
    .split('.')
    .map(Number);
}

function isAtLeastVersion(current: string, minimum: string): boolean {
  const a = parseSemver(current);
  const b = parseSemver(minimum);
  for (let i = 0; i < 3; i += 1) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return true;
}

function readRootPackage(cwd: string): PackageJson {
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found in ${cwd}`);
  }

  return JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as PackageJson;
}

function resolveMigrationProfile(cwd: string): MigrationProfile {
  const pkg = readRootPackage(cwd);
  const packVersion = pkg.dependencies?.[LINTERS_PACK] ?? pkg.devDependencies?.[LINTERS_PACK];

  if (packVersion && isAtLeastVersion(packVersion, MIN_PACK_VERSION)) {
    return { pkg, oxfmtConfigImport: LINTERS_PACK, packLintStaged: true };
  }

  if (packVersion && !isAtLeastVersion(packVersion, MIN_PACK_VERSION)) {
    throw new Error(`Update ${LINTERS_PACK} to >= ${MIN_PACK_VERSION} (now: ${packVersion}), run pnpm install, retry.`);
  }

  throw new Error(`Add ${LINTERS_PACK} (>= ${MIN_PACK_VERSION}) to the repo root, run pnpm install, then retry.`);
}

function readPrettierIgnorePatterns(cwd: string): string[] | null {
  const prettierIgnorePath = path.join(cwd, '.prettierignore');
  if (!fs.existsSync(prettierIgnorePath)) {
    return null;
  }

  return [
    ...new Set(
      readText(cwd, '.prettierignore')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#')),
    ),
  ];
}

function renderMinimalOxfmtConfig(oxfmtConfigImport: string): string {
  return `import { defineConfig } from 'oxfmt';

import { defaultOxfmtConfig } from '${oxfmtConfigImport}';

export default defineConfig(defaultOxfmtConfig);
`;
}

function quoteIgnorePattern(pattern: string): string {
  return JSON.stringify(pattern);
}

function renderOxfmtConfig(prettierIgnore: string[] | null, oxfmtConfigImport: string): string {
  if (prettierIgnore === null || prettierIgnore.length === 0) {
    return renderMinimalOxfmtConfig(oxfmtConfigImport);
  }

  const quoted = prettierIgnore.map(quoteIgnorePattern).join(', ');

  return `import { defineConfig } from 'oxfmt';

import { defaultOxfmtConfig } from '${oxfmtConfigImport}';

export default defineConfig({
  ...defaultOxfmtConfig,
  ignorePatterns: [${quoted}],
});
`;
}

function writeOxfmtConfig(ctx: MigrationContext, oxfmtConfigImport: string): void {
  ctx.write(OXFMT_CONFIG_FILE, renderOxfmtConfig(readPrettierIgnorePatterns(ctx.cwd), oxfmtConfigImport));
  for (const legacy of LEGACY_OXFMT_CONFIGS) {
    ctx.remove(legacy);
  }
}

const OXFMT_ESLINT_FILE_BLOCK = `  {
    files: ['oxfmt.config.mts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },`;

function appendToEslintFlatArray(source: string, blocks: string): { content: string; migrated: boolean } {
  const closing = source.lastIndexOf('];');
  if (closing === -1) return { content: source, migrated: false };
  return {
    content: `${source.slice(0, closing)}${blocks}\n${source.slice(closing)}`,
    migrated: true,
  };
}

function migrateMonorepoEslintFallback(source: string): { content: string; migrated: boolean } {
  if (!source.includes('@cloud-ru/eslint-config/monorepo')) {
    return { content: source, migrated: false };
  }

  const blocks: string[] = [];
  if (!RE_PRETTIER_OFF.test(source)) {
    blocks.push(MONOREPO_PRETTIER_OFF);
  }
  if (!RE_OXFMT_CONFIG_ESLINT.test(source)) {
    blocks.push(OXFMT_ESLINT_FILE_BLOCK);
  }

  if (blocks.length === 0) {
    return { content: source, migrated: true };
  }

  return appendToEslintFlatArray(source, blocks.join('\n'));
}

function migrateEslintSource(source: string): { content: string; migrated: boolean } {
  if (source.includes(ESLINT_MONOREPO_OXFMT)) {
    return { content: source, migrated: true };
  }

  const withMonorepoOxfmt = source
    .replace(RE_CLOUD_RU_MONOREPO_IMPORT, ESLINT_MONOREPO_OXFMT)
    .replace(RE_LOCAL_MONOREPO_JS, 'eslint-config/monorepo-oxfmt.js');
  if (withMonorepoOxfmt !== source) {
    return { content: withMonorepoOxfmt, migrated: true };
  }

  return migrateMonorepoEslintFallback(source);
}

function migrateEslint(ctx: MigrationContext): void {
  const eslintFile = firstExistingFile(ctx.cwd, ESLINT_CANDIDATES);
  if (!eslintFile) {
    ctx.warn('No eslint.config.* — use @cloud-ru/eslint-config/monorepo-oxfmt manually.');
    return;
  }

  const result = migrateEslintSource(readText(ctx.cwd, eslintFile));
  if (result.migrated) {
    ctx.write(eslintFile, result.content);
    return;
  }

  ctx.warn(`${eslintFile}: adjust ESLint for oxfmt manually.`);
}

function plainLintStagedExport(): string {
  return `module.exports = require('${LINTERS_PACK}').${LINT_STAGED_OXFMT};\n`;
}

function replacePrettierCommandsInLintStaged(source: string): string {
  return source
    .replace(/\bprettier --write\b/g, OXFMT_LINT_STAGED_WRITE)
    .replace(/\bprettier --check\b/g, 'oxfmt --check');
}

function migrateLintStagedSource(
  source: string,
  packLintStaged: boolean,
): {
  content: string;
  action: 'write' | 'skip' | 'warn';
} {
  const trimmed = source.trim();

  if (trimmed.includes(LINT_STAGED_OXFMT)) {
    return { content: source, action: 'skip' };
  }

  if (packLintStaged && trimmed.includes(LINT_STAGED_DEFAULT)) {
    if (RE_PLAIN_LINT_STAGED.test(trimmed)) {
      return { content: plainLintStagedExport(), action: 'write' };
    }

    const withPreset = source.replace(RE_LINT_STAGED_PRESET, `$1${LINT_STAGED_OXFMT}`);
    if (withPreset !== source) {
      return { content: withPreset, action: 'write' };
    }
  }

  if (/\bprettier --write\b/.test(source) || /\bprettier --check\b/.test(source)) {
    return { content: replacePrettierCommandsInLintStaged(source), action: 'write' };
  }

  if (packLintStaged && trimmed.includes(LINT_STAGED_DEFAULT)) {
    return { content: source, action: 'warn' };
  }

  return { content: source, action: 'warn' };
}

function migrateLintStaged(ctx: MigrationContext, packLintStaged: boolean): void {
  const lintStagedPath = 'lint-staged.config.js';
  if (!fs.existsSync(path.join(ctx.cwd, lintStagedPath))) {
    ctx.warn('No lint-staged.config.js — use defaultLintStagedConfigWithOxfmt or oxfmt in custom config.');
    return;
  }

  const result = migrateLintStagedSource(readText(ctx.cwd, lintStagedPath), packLintStaged);
  if (result.action === 'write') ctx.write(lintStagedPath, result.content);
  if (result.action === 'warn') {
    ctx.warn('Custom lint-staged — ensure staged files run oxfmt --write.');
  }
}

function migrateScripts(scripts: Record<string, string> = {}): Record<string, string> {
  return {
    ...scripts,
    'lint:fmt': 'oxfmt --check .',
    'lint:fmt:fix': 'oxfmt --write .',
  };
}

const DEPENDENCIES_TO_REMOVE = ['prettier', '@cloud-ru/ft-config-prettier', 'oxfmt', OXFMT_CONFIG_PKG] as const;

function migratePackageJson(ctx: MigrationContext, profile: MigrationProfile): void {
  const dependencies = { ...(profile.pkg.dependencies ?? {}) };
  const devDependencies = { ...(profile.pkg.devDependencies ?? {}) };

  for (const name of DEPENDENCIES_TO_REMOVE) {
    delete dependencies[name];
    delete devDependencies[name];
  }

  const nextPkg = {
    ...profile.pkg,
    scripts: migrateScripts(profile.pkg.scripts),
    dependencies: Object.keys(dependencies).length > 0 ? dependencies : undefined,
    devDependencies: Object.keys(devDependencies).length > 0 ? devDependencies : undefined,
  };

  ctx.write('package.json', `${JSON.stringify(nextPkg, null, 2)}\n`);
}

function removePrettierArtifacts(ctx: MigrationContext): void {
  ctx.remove('prettier.config.js');
  ctx.remove('.prettierignore');

  if (fs.existsSync(path.join(ctx.cwd, '.oxfmtrc.json'))) {
    ctx.warn(`Remove .oxfmtrc.json if using ${OXFMT_CONFIG_FILE}.`);
  }
}

function buildOxcWorkspaceSettings(): Record<string, unknown> {
  const settings: Record<string, unknown> = {
    'editor.formatOnSave': true,
    'editor.formatOnSaveMode': 'file',
    'editor.defaultFormatter': OXC_VSCODE,
    'prettier.enable': false,
  };

  for (const language of OXC_LANGUAGES) {
    settings[`[${language}]`] = { 'editor.defaultFormatter': OXC_VSCODE };
  }

  return settings;
}

function mergeSettings(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    const isLanguageBlock = key.startsWith('[');
    const isObject = value && typeof value === 'object' && !Array.isArray(value);

    if (isLanguageBlock && isObject) {
      const previous = merged[key];
      merged[key] =
        previous && typeof previous === 'object' && !Array.isArray(previous)
          ? { ...(previous as Record<string, unknown>), ...(value as Record<string, unknown>) }
          : value;
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

function migrateVsCode(ctx: MigrationContext): void {
  const settingsPath = '.vscode/settings.json';
  const extensionsPath = '.vscode/extensions.json';

  const existingSettings = readJson(ctx.cwd, settingsPath);
  if (fs.existsSync(path.join(ctx.cwd, settingsPath)) && !existingSettings) {
    ctx.warn('.vscode/settings.json is not plain JSON — merge Oxc keys from README manually.');
  } else {
    const merged = mergeSettings(existingSettings ?? {}, buildOxcWorkspaceSettings());
    if (merged['oxc.fmt.configPath'] === 'oxfmt.config.js') {
      delete merged['oxc.fmt.configPath'];
    }
    ctx.write(settingsPath, `${JSON.stringify(merged, null, 2)}\n`);
  }

  const extensions = readJson(ctx.cwd, extensionsPath) as { recommendations?: string[] } | undefined;
  if (fs.existsSync(path.join(ctx.cwd, extensionsPath)) && !extensions) {
    ctx.warn('.vscode/extensions.json is not valid JSON — add recommendation oxc.oxc-vscode manually.');
  } else {
    const recommendations = [...new Set([...(extensions?.recommendations ?? []), OXC_VSCODE])];
    ctx.write(extensionsPath, `${JSON.stringify({ ...extensions, recommendations }, null, 2)}\n`);
  }
}

function runMigration(cwd: string, dryRun: boolean): string[] {
  const ctx = createContext(cwd, dryRun);
  const profile = resolveMigrationProfile(cwd);

  writeOxfmtConfig(ctx, profile.oxfmtConfigImport);
  migrateEslint(ctx);
  migrateLintStaged(ctx, profile.packLintStaged);
  migratePackageJson(ctx, profile);
  removePrettierArtifacts(ctx);
  migrateVsCode(ctx);

  return ctx.warnings;
}

function main(): void {
  try {
    const { cwd, dryRun } = parseCli(process.argv.slice(2));
    const warnings = runMigration(cwd, dryRun);
    warnings.forEach(message => console.warn(`warn: ${message}`));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
