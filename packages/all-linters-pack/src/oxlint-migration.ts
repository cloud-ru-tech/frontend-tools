import { execFileSync } from 'child_process';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { pathToFileURL } from 'url';

import { baseOxlintConfig, monorepoOxlintConfig } from '@cloud-ru/ft-config-oxlint';

import { migrateToOxfmt } from './oxfmt-migration';

const MIN_PACK_VERSION = '1.2.0';
const LINTERS_PACK = '@cloud-ru/ft-all-linters-pack';
const OXLINT_CONFIG_PKG = '@cloud-ru/ft-config-oxlint';

const OXLINT_CONFIG_FILE = 'oxlint.config.mts';
const OXLINTRC_FILE = '.oxlintrc.json';
const PLAYWRIGHT_CONFIG_FILES = ['playwright.config.ts', 'playwright.config.mts', 'playwright.config.js'];
const PLAYWRIGHT_OVERRIDE = 'playwrightTestsOxlintOverride';
const OXFMT_CONFIG_FILE = 'oxfmt.config.mts';
const LINT_STAGED_FILE = 'lint-staged.config.js';
const LINT_STAGED_PRESET = 'defaultLintStagedConfigWithOxlintAndOxfmt';

const ESLINT_CONFIG_FILES = [
  'eslint.config.mjs',
  'eslint.config.js',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
];
const LEGACY_ESLINT_FILES = [
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintrc.yaml',
];
const ESLINT_IGNORE_FILE = '.eslintignore';

type PresetKind = 'base' | 'monorepo';

type RuleValue = string | [string, ...unknown[]];
type Rules = Record<string, RuleValue>;

type OxlintOverride = {
  files: string[];
  excludeFiles?: string[];
  rules: Rules;
};

type OxlintPreset = {
  rules?: Record<string, unknown>;
  overrides?: OxlintOverride[];
  jsPlugins?: Array<string | { name: string }>;
};

const PRESETS: Record<PresetKind, { exportName: string; config: OxlintPreset }> = {
  base: { exportName: 'baseOxlintConfig', config: baseOxlintConfig as OxlintPreset },
  monorepo: { exportName: 'monorepoOxlintConfig', config: monorepoOxlintConfig as OxlintPreset },
};

const ESLINT_PRESET_MODULES: Array<{ specifier: string; kind: PresetKind }> = [
  { specifier: '@cloud-ru/eslint-config', kind: 'base' },
  { specifier: '@cloud-ru/eslint-config/monorepo', kind: 'monorepo' },
  { specifier: '@cloud-ru/eslint-config/monorepo-oxfmt', kind: 'monorepo' },
];

const NATIVE_PLUGIN_PREFIXES: Array<[string, string]> = [
  ['@typescript-eslint/', 'typescript/'],
  ['react-hooks/', 'react/'],
  ['@vitest/', 'vitest/'],
];

const NATIVE_PLUGINS = new Set([
  '@typescript-eslint',
  '@vitest',
  '@next/next',
  'import',
  'jest',
  'jsdoc',
  'jsx-a11y',
  'n',
  'node',
  'prettier',
  'promise',
  'react',
  'react-hooks',
  'react-perf',
  'unicorn',
  'vitest',
]);

const IMPORT_RULE_REPLACEMENTS: Record<string, string> = {
  'import/no-default-export': 'no-restricted-exports',
  'import/no-dynamic-require': 'import-js/no-dynamic-require',
};

const RESTRICT_DEFAULT_EXPORTS = { direct: true, named: true, defaultFrom: true, namedFrom: true, namespaceFrom: true };

const DROPPED_RULES = new Set([
  'prettier/prettier',
  'react/jsx-uses-react',
  'react/jsx-uses-vars',
  'no-only-tests/no-only-tests',
]);

const RE_ESLINT_COMMAND = /(?:^|&&|\|\||;|\s)(?:npx\s+|pnpm\s+(?:exec\s+)?)?eslint(?=\s|$)([^&|;]*)/;
const RE_ESLINT_PACKAGE =
  /^(eslint|typescript-eslint|@eslint\/.+|@typescript-eslint\/.+|eslint-(plugin|config|import-resolver)-.+|@[^/]+\/eslint-(plugin|config)(-.+)?)$/;

export type MigrationOptions = {
  cwd: string;
  dryRun?: boolean;
};

export type MigrationReport = {
  changes: string[];
  warnings: string[];
};

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
};

type EslintBlock = {
  files?: unknown[];
  ignores?: string[];
  rules?: Record<string, unknown>;
  plugins?: Record<string, unknown>;
  settings?: unknown;
  languageOptions?: unknown;
  processor?: unknown;
  linterOptions?: unknown;
};

type ExternalJsPlugin = { name: string; specifier: string };

type ConvertedEslintConfig = {
  kind: PresetKind;
  jsPlugins: ExternalJsPlugin[];
  ignorePatterns: string[];
  rules: Rules;
  overrides: OxlintOverride[];
  playwrightTests: string[];
  unsupportedRules: string[];
};

const emptyConvertedConfig = (kind: PresetKind): ConvertedEslintConfig => ({
  kind,
  jsPlugins: [],
  ignorePatterns: [],
  rules: {},
  overrides: [],
  playwrightTests: [],
  unsupportedRules: [],
});

class MigrationContext {
  readonly report: MigrationReport = { changes: [], warnings: [] };

  constructor(
    readonly cwd: string,
    readonly dryRun: boolean,
  ) {}

  resolve(relativePath: string): string {
    return path.join(this.cwd, relativePath);
  }

  exists(relativePath: string): boolean {
    return fs.existsSync(this.resolve(relativePath));
  }

  read(relativePath: string): string {
    return fs.readFileSync(this.resolve(relativePath), 'utf8');
  }

  write(relativePath: string, content: string): void {
    const exists = this.exists(relativePath);
    if (exists && this.read(relativePath) === content) return;
    if (!this.dryRun) fs.writeFileSync(this.resolve(relativePath), content, 'utf8');
    this.report.changes.push(`${exists ? 'update' : 'create'} ${relativePath}`);
  }

  remove(relativePath: string): void {
    if (!this.exists(relativePath)) return;
    if (!this.dryRun) fs.rmSync(this.resolve(relativePath));
    this.report.changes.push(`remove ${relativePath}`);
  }

  warn(message: string): void {
    this.report.warnings.push(message);
  }
}

const importModule = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<{ default: unknown }>;

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
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
  }
  return true;
}

function readPackageJson(ctx: MigrationContext): PackageJson {
  if (!ctx.exists('package.json')) {
    throw new Error(`package.json not found in ${ctx.cwd}`);
  }
  return JSON.parse(ctx.read('package.json')) as PackageJson;
}

function assertPackVersion(pkg: PackageJson): void {
  const version = pkg.dependencies?.[LINTERS_PACK] ?? pkg.devDependencies?.[LINTERS_PACK];
  if (!version) {
    throw new Error(`Add ${LINTERS_PACK} (>= ${MIN_PACK_VERSION}) to the repo root, run pnpm install, then retry.`);
  }
  if (!version.startsWith('workspace:') && !isAtLeastVersion(version, MIN_PACK_VERSION)) {
    throw new Error(`Update ${LINTERS_PACK} to >= ${MIN_PACK_VERSION} (now: ${version}), run pnpm install, retry.`);
  }
}

function resolveOxlintPackageJson(cwd: string): string {
  const projectRequire = createRequire(path.join(cwd, 'package.json'));
  try {
    return projectRequire.resolve('oxlint/package.json');
  } catch {
    const configRequire = createRequire(projectRequire.resolve(`${OXLINT_CONFIG_PKG}/package.json`));
    return configRequire.resolve('oxlint/package.json');
  }
}

function loadOxlintRuleNames(cwd: string): Set<string> | null {
  try {
    const schemaPath = path.join(path.dirname(resolveOxlintPackageJson(cwd)), 'configuration_schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8')) as {
      definitions?: { DummyRuleMap?: { properties?: Record<string, unknown> } };
    };
    const names = Object.keys(schema.definitions?.DummyRuleMap?.properties ?? {});
    return names.length > 0 ? new Set(names) : null;
  } catch {
    return null;
  }
}

function presetJsPluginNames(): string[] {
  return Object.values(PRESETS).flatMap(({ config }) =>
    (config.jsPlugins ?? []).map(plugin => (typeof plugin === 'string' ? plugin : plugin.name)),
  );
}

function normalizeSeverity(value: unknown): RuleValue | null {
  const [severity, ...options] = Array.isArray(value) ? value : [value];
  const normalized = ({ 0: 'off', 1: 'warn', 2: 'error', off: 'off', warn: 'warn', error: 'error' } as const)[
    String(severity) as '0'
  ];
  if (!normalized) return null;
  return options.length > 0 ? [normalized, ...options] : normalized;
}

function toOxlintRuleName(name: string, oxlintRules: Set<string> | null, jsPlugins: string[]): string | null {
  const prefix = NATIVE_PLUGIN_PREFIXES.find(([eslintPrefix]) => name.startsWith(eslintPrefix));
  const candidate = prefix ? prefix[1] + name.slice(prefix[0].length) : name;

  if (candidate.startsWith('import/')) return IMPORT_RULE_REPLACEMENTS[candidate] ?? null;
  if (jsPlugins.some(plugin => candidate.startsWith(`${plugin}/`))) return candidate;
  if (!oxlintRules || oxlintRules.has(candidate)) return candidate;

  const coreName = candidate.replace(/^typescript\//, '');
  return oxlintRules.has(coreName) ? coreName : null;
}

function convertRuleOptions(name: string, severity: RuleValue): RuleValue {
  const [level, ...options] = Array.isArray(severity) ? severity : [severity];
  if (level === 'off') return severity;
  if (name === 'no-restricted-exports') {
    return [level, { restrictDefaultExports: RESTRICT_DEFAULT_EXPORTS }];
  }
  const isShorthand = options.every(
    option =>
      typeof option === 'string' ||
      (option !== null && typeof option === 'object' && !('paths' in option) && !('patterns' in option)),
  );
  if (name === 'no-restricted-imports' && options.length > 0 && isShorthand) {
    return [level, { paths: options }];
  }
  return severity;
}

function convertRules(
  rules: Record<string, unknown>,
  oxlintRules: Set<string> | null,
  jsPlugins: string[],
  unsupported: Set<string>,
): Rules {
  const result: Rules = {};
  for (const [name, value] of Object.entries(rules)) {
    if (DROPPED_RULES.has(name)) continue;
    const oxlintName = toOxlintRuleName(name, oxlintRules, jsPlugins);
    const severity = normalizeSeverity(value);
    if (!oxlintName || !severity) {
      unsupported.add(name);
      continue;
    }
    result[oxlintName] = convertRuleOptions(oxlintName, severity);
  }
  return result;
}

async function loadEslintPresetBlocks(cwd: string): Promise<Map<unknown, Set<PresetKind>>> {
  const blocks = new Map<unknown, Set<PresetKind>>();
  const projectRequire = createRequire(path.join(cwd, 'package.json'));
  for (const { specifier, kind } of ESLINT_PRESET_MODULES) {
    try {
      const preset = (await importModule(pathToFileURL(projectRequire.resolve(specifier)).href)).default;
      if (!Array.isArray(preset)) continue;
      preset.forEach(block => blocks.set(block, new Set([...(blocks.get(block) ?? []), kind])));
    } catch {
      continue;
    }
  }
  return blocks;
}

function detectKind(config: unknown[], presetBlocks: Map<unknown, Set<PresetKind>>): PresetKind | null {
  const kinds = config
    .map(block => presetBlocks.get(block))
    .filter((value): value is Set<PresetKind> => Boolean(value));
  if (kinds.length === 0) return null;
  return kinds.some(set => set.size === 1 && set.has('monorepo')) ? 'monorepo' : 'base';
}

function detectKindFromSource(source: string): PresetKind {
  return /eslint-config\/monorepo/.test(source) ? 'monorepo' : 'base';
}

async function loadEslintConfig(ctx: MigrationContext, eslintFile: string) {
  const previousCwd = process.cwd();
  try {
    process.chdir(ctx.cwd);
    const presetBlocks = await loadEslintPresetBlocks(ctx.cwd);
    const config = (await importModule(pathToFileURL(ctx.resolve(eslintFile)).href)).default;
    return { presetBlocks, config };
  } finally {
    process.chdir(previousCwd);
  }
}

function resolvePluginPackage(cwd: string, namespace: string): string | null {
  const projectRequire = createRequire(path.join(cwd, 'package.json'));
  let candidates = [`eslint-plugin-${namespace}`];
  if (namespace.startsWith('@')) {
    const [scope, name] = namespace.split('/');
    candidates = name ? [`${scope}/eslint-plugin-${name}`, `${scope}/${name}`] : [`${scope}/eslint-plugin`];
  }
  return (
    candidates.find(candidate => {
      try {
        projectRequire.resolve(candidate);
        return true;
      } catch {
        return false;
      }
    }) ?? null
  );
}

const isEslintConfigFile = (file: string) => ESLINT_CONFIG_FILES.includes(file);

async function convertEslintConfig(ctx: MigrationContext, eslintFile: string): Promise<ConvertedEslintConfig | null> {
  let loaded: Awaited<ReturnType<typeof loadEslintConfig>>;
  try {
    loaded = await loadEslintConfig(ctx, eslintFile);
  } catch (error) {
    ctx.warn(`Could not load ${eslintFile}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }

  const { presetBlocks, config } = loaded;
  if (!Array.isArray(config)) {
    ctx.warn(`${eslintFile} does not export a flat config array.`);
    return null;
  }

  let kind = detectKind(config, presetBlocks);
  if (!kind) {
    kind = detectKindFromSource(ctx.read(eslintFile));
    ctx.warn(`${eslintFile}: no @cloud-ru/eslint-config preset found, using the ${kind} Oxlint preset.`);
  }

  const projectBlocks = (config as EslintBlock[]).filter(
    block => block && typeof block === 'object' && !presetBlocks.has(block),
  );
  const result = emptyConvertedConfig(kind);

  const presetPlugins = presetJsPluginNames();
  const pluginNames = new Set(projectBlocks.flatMap(block => Object.keys(block.plugins ?? {})));
  for (const name of pluginNames) {
    if (NATIVE_PLUGINS.has(name) || presetPlugins.includes(name)) continue;
    const specifier = resolvePluginPackage(ctx.cwd, name);
    if (specifier) {
      result.jsPlugins.push({ name, specifier });
    } else {
      ctx.warn(
        `${eslintFile}: plugin "${name}" is not an npm package — add it to \`jsPlugins\` of ${OXLINT_CONFIG_FILE} by path if still needed.`,
      );
    }
  }

  const oxlintRules = loadOxlintRuleNames(ctx.cwd);
  const knownJsPlugins = [...presetPlugins, ...result.jsPlugins.map(plugin => plugin.name)];
  const unsupported = new Set<string>();

  for (const block of projectBlocks) {
    const keys = Object.keys(block).filter(key => key !== 'name');
    if (keys.length === 1 && keys[0] === 'ignores') {
      result.ignorePatterns.push(...(block.ignores ?? []));
      continue;
    }

    const allFiles = (block.files ?? []).flat(Infinity).filter((file): file is string => typeof file === 'string');
    const files = allFiles.filter(file => !isEslintConfigFile(file));
    const rules = convertRules(block.rules ?? {}, oxlintRules, knownJsPlugins, unsupported);
    if (allFiles.length === 0 && !block.ignores?.length) {
      Object.assign(result.rules, rules);
    } else if (files.length > 0 && Object.keys(rules).length > 0) {
      result.overrides.push({ files, ...(block.ignores?.length ? { excludeFiles: block.ignores } : {}), rules });
    }

    if (block.settings || block.languageOptions || block.processor || block.linterOptions) {
      ctx.warn(
        `${eslintFile}: settings / languageOptions / processor of a block were not converted (files: ${allFiles.join(', ') || '**/*'}).`,
      );
    }
  }

  result.unsupportedRules = [...unsupported].sort();
  if (result.unsupportedRules.length > 0) {
    ctx.warn(`Rules without an Oxlint equivalent were skipped: ${result.unsupportedRules.join(', ')}.`);
  }
  return result;
}

function dropRedundantOverrides(kind: PresetKind, overrides: OxlintOverride[]): OxlintOverride[] {
  const preset = PRESETS[kind].config;
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

  return overrides
    .map(override => {
      const rules = Object.fromEntries(
        Object.entries(override.rules).filter(([name, value]) => {
          const inPresetOverride = (preset.overrides ?? []).some(
            presetOverride =>
              !override.excludeFiles &&
              override.files.every(file => presetOverride.files.includes(file)) &&
              same(presetOverride.rules[name], value),
          );
          const inPresetRules =
            !override.excludeFiles && same(override.files, ['**/*']) && same(preset.rules?.[name], value);
          return !inPresetOverride && !inPresetRules;
        }),
      );
      return { ...override, rules };
    })
    .filter(override => Object.keys(override.rules).length > 0);
}

function readEslintIgnore(ctx: MigrationContext): string[] {
  if (!ctx.exists(ESLINT_IGNORE_FILE)) return [];
  return ctx
    .read(ESLINT_IGNORE_FILE)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

class RawTs {
  constructor(readonly code: string) {}
}

const quote = (value: string) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function toTsLiteral(value: unknown, indent = ''): string {
  const inner = `${indent}  `;
  if (typeof value === 'string') return quote(value);
  if (value instanceof RawTs) return value.code;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(item => toTsLiteral(item, inner));
    const inline = `[${items.join(', ')}]`;
    return items.every(item => !item.includes('\n')) && inline.length <= 80
      ? inline
      : `[\n${items.map(item => `${inner}${item},`).join('\n')}\n${indent}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const lines = entries.map(
      ([key, item]) => `${inner}${IDENTIFIER.test(key) ? key : quote(key)}: ${toTsLiteral(item, inner)},`,
    );
    return `{\n${lines.join('\n')}\n${indent}}`;
  }
  return String(value);
}

function readPlaywrightTests(ctx: MigrationContext): string[] {
  const configFile = PLAYWRIGHT_CONFIG_FILES.find(file => ctx.exists(file));
  if (!configFile) return [];
  const source = ctx.read(configFile);
  const testMatch = /\btestMatch:\s*(\[[^\]]*\]|(['"`])[^'"`]*\2)/.exec(source)?.[1];
  const testDir = /\btestDir:\s*(['"`])([^'"`]*)\1/.exec(source)?.[2];
  const prefix = testDir ? path.posix.normalize(testDir).replace(/^\.\/?/, '') : '';
  const globs = [...(testMatch ?? '').matchAll(/(['"`])([^'"`]+)\1/g)].map(([, , glob]) => glob);
  const folders = globs.map(glob => glob.replace(/[^/]*$/, '*'));
  return [...new Set(folders.map(glob => (prefix && !glob.startsWith('**') ? path.posix.join(prefix, glob) : glob)))];
}

function renderOxlintConfig({
  kind,
  jsPlugins,
  ignorePatterns,
  rules,
  overrides,
  playwrightTests,
  unsupportedRules,
}: ConvertedEslintConfig): string {
  const { exportName, config: preset } = PRESETS[kind];
  const extra: Record<string, unknown> = {};
  if (jsPlugins.length > 0) extra.jsPlugins = jsPlugins;
  if (ignorePatterns.length > 0) extra.ignorePatterns = ignorePatterns;
  const projectRules = Object.fromEntries(
    Object.entries(rules).filter(([name, value]) => JSON.stringify(preset.rules?.[name]) !== JSON.stringify(value)),
  );
  if (Object.keys(projectRules).length > 0) extra.rules = projectRules;
  const projectOverrides: unknown[] = dropRedundantOverrides(kind, overrides);
  if (playwrightTests.length > 0)
    projectOverrides.unshift(new RawTs(`${PLAYWRIGHT_OVERRIDE}(${toTsLiteral(playwrightTests, '      ')})`));
  if (projectOverrides.length > 0) extra.overrides = projectOverrides;
  const imports = [
    'mergeOxlintConfigs',
    ...(playwrightTests.length > 0 ? [PLAYWRIGHT_OVERRIDE] : []),
    exportName,
  ].sort();

  const note =
    unsupportedRules.length > 0
      ? `\n// ESLint rules without an Oxlint equivalent (not migrated): ${unsupportedRules.join(', ')}\n`
      : '';

  if (Object.keys(extra).length === 0) {
    return `import { defineConfig } from 'oxlint';

import { ${exportName} } from '${LINTERS_PACK}';
${note}
export default defineConfig(${exportName});
`;
  }

  return `import { defineConfig } from 'oxlint';

import { ${imports.join(', ')} } from '${LINTERS_PACK}';
${note}
export default defineConfig(mergeOxlintConfigs(${exportName}, ${toTsLiteral(extra)}));
`;
}

function migrateFormatter(ctx: MigrationContext): void {
  if (ctx.exists(OXFMT_CONFIG_FILE)) return;
  const { changes, warnings } = migrateToOxfmt({ cwd: ctx.cwd, dryRun: ctx.dryRun, skipEslint: true });
  ctx.report.changes.push(...changes.map(change => `${change} (oxfmt)`));
  warnings.forEach(warning => ctx.warn(`oxfmt: ${warning}`));
}

async function migrateEslintConfig(ctx: MigrationContext): Promise<ConvertedEslintConfig> {
  const eslintFile = ESLINT_CONFIG_FILES.find(file => ctx.exists(file));
  if (ctx.exists(OXLINT_CONFIG_FILE)) {
    const kind = ctx.read(OXLINT_CONFIG_FILE).includes(PRESETS.monorepo.exportName) ? 'monorepo' : 'base';
    ctx.warn(`${OXLINT_CONFIG_FILE} already exists and was kept — delete it to generate it again.`);
    return emptyConvertedConfig(kind);
  }
  const converted = eslintFile ? await convertEslintConfig(ctx, eslintFile) : null;

  let kind: PresetKind = 'base';
  if (converted) kind = converted.kind;
  else if (eslintFile) kind = detectKindFromSource(ctx.read(eslintFile));
  else ctx.warn(`No eslint.config.* found, using the ${kind} preset.`);

  const config = converted ?? emptyConvertedConfig(kind);
  config.playwrightTests = readPlaywrightTests(ctx);
  config.ignorePatterns = [...new Set([...readEslintIgnore(ctx), ...config.ignorePatterns])];
  ctx.write(OXLINT_CONFIG_FILE, renderOxlintConfig(config));

  if (eslintFile && !converted) {
    ctx.warn(`${eslintFile} is kept — move its project rules to ${OXLINT_CONFIG_FILE} manually, then delete it.`);
  } else if (eslintFile) {
    ctx.remove(eslintFile);
  }
  [...LEGACY_ESLINT_FILES, ESLINT_IGNORE_FILE].forEach(file => ctx.remove(file));
  if (ctx.exists(OXLINTRC_FILE)) {
    ctx.warn(`${OXLINTRC_FILE} is ignored when ${OXLINT_CONFIG_FILE} exists — move its settings and delete it.`);
  }

  return config;
}

function migrateLintStaged(ctx: MigrationContext): void {
  const content = `module.exports = require('${LINTERS_PACK}').${LINT_STAGED_PRESET};\n`;

  if (!ctx.exists(LINT_STAGED_FILE)) {
    ctx.write(LINT_STAGED_FILE, content);
    return;
  }
  const isPackPreset =
    /^module\.exports\s*=\s*require\(['"]@cloud-ru\/ft-(all-linters-pack|config-lint-staged)['"]\)\.\w+;?$/.test(
      ctx.read(LINT_STAGED_FILE).trim(),
    );
  if (isPackPreset) {
    ctx.write(LINT_STAGED_FILE, content);
    return;
  }

  const source = ctx.read(LINT_STAGED_FILE);
  const migrated = source.replace(/(['"`]\s*(?:npx\s+|pnpm\s+(?:exec\s+)?)?)eslint(?=[\s'"`])/g, '$1oxlint');
  if (migrated !== source) {
    ctx.write(LINT_STAGED_FILE, migrated);
    ctx.warn(
      `${LINT_STAGED_FILE} is custom: eslint was replaced with oxlint — check the commands (ESLint-only flags).`,
    );
  } else {
    ctx.warn(`${LINT_STAGED_FILE} is custom and has no eslint command — check it manually.`);
  }
}

function globBase(target: string): string {
  const segments = target.split('/');
  const firstGlob = segments.findIndex(segment => /[*?{}[\]!]/.test(segment));
  if (firstGlob === -1) return target;
  return segments.slice(0, firstGlob).join('/') || '.';
}

function eslintScriptTargets(scripts: Record<string, string>): string[] | null {
  const names = ['lint:es', 'lint:eslint', 'lint', ...Object.keys(scripts)];
  for (const name of names) {
    const match = scripts[name] && RE_ESLINT_COMMAND.exec(scripts[name]);
    if (!match) continue;
    const targets = match[1]
      .trim()
      .split(/\s+/)
      .map(arg => arg.replace(/^['"]|['"]$/g, ''))
      .filter(arg => arg && !arg.startsWith('-'))
      .map(globBase);
    if (targets.length > 0) return [...new Set(targets)];
  }
  return null;
}

function oxlintScripts(scripts: Record<string, string>): { 'lint:oxlint': string; 'lint:oxlint:fix': string } {
  const args = (eslintScriptTargets(scripts) ?? ['.']).join(' ');
  return { 'lint:oxlint': `oxlint ${args}`, 'lint:oxlint:fix': `oxlint --fix ${args}` };
}

function migrateScripts(ctx: MigrationContext, pkg: PackageJson, { jsPlugins }: ConvertedEslintConfig): void {
  const scripts = pkg.scripts ?? {};
  const nextScripts: Record<string, string> = { ...scripts };
  for (const [name, command] of Object.entries(oxlintScripts(scripts))) {
    nextScripts[name] ??= command;
  }

  const raw = ctx.read('package.json');
  const indent = /^(\s+)"/m.exec(raw)?.[1] ?? '  ';
  ctx.write('package.json', `${JSON.stringify({ ...pkg, scripts: nextScripts }, null, indent)}\n`);

  const eslintScripts = Object.keys(scripts).filter(name => RE_ESLINT_COMMAND.test(scripts[name]));
  if (eslintScripts.length > 0) {
    ctx.warn(
      `Scripts still calling ESLint: ${eslintScripts.join(', ')} — replace them with lint:oxlint (e.g. in lint:all).`,
    );
  }
  const usedPlugins = new Set(jsPlugins.map(({ specifier }) => specifier));
  const eslintDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter(
    name => RE_ESLINT_PACKAGE.test(name) && !usedPlugins.has(name),
  );
  if (eslintDeps.length > 0) {
    ctx.warn(`ESLint packages in package.json can be removed: ${eslintDeps.join(', ')}.`);
  }
}

function resolvePackageBin(cwd: string, name: string): string {
  const packageJsonPath = createRequire(path.join(cwd, 'package.json')).resolve(`${name}/package.json`);
  const { bin } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { bin: string | Record<string, string> };
  return path.join(path.dirname(packageJsonPath), typeof bin === 'string' ? bin : bin[name]);
}

function formatOxlintConfig(ctx: MigrationContext): void {
  if (ctx.dryRun) return;
  try {
    execFileSync(process.execPath, [resolvePackageBin(ctx.cwd, 'oxfmt'), '--write', OXLINT_CONFIG_FILE], {
      cwd: ctx.cwd,
      stdio: 'ignore',
    });
  } catch {
    ctx.warn(`Could not format ${OXLINT_CONFIG_FILE} with oxfmt — run it manually.`);
  }
}

export async function migrateToOxlint({ cwd, dryRun = false }: MigrationOptions): Promise<MigrationReport> {
  const ctx = new MigrationContext(cwd, dryRun);
  const pkg = readPackageJson(ctx);
  assertPackVersion(pkg);
  migrateFormatter(ctx);

  const config = await migrateEslintConfig(ctx);
  migrateLintStaged(ctx);
  migrateScripts(ctx, readPackageJson(ctx), config);
  formatOxlintConfig(ctx);

  return ctx.report;
}
