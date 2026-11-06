import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import configOxlint from '../src/index.js';

const {
  baseOxlintConfig,
  defaultOxlintConfigRelativePath,
  mergeOxlintConfigs,
  monorepoOxlintConfig,
  playwrightTestsOxlintOverride,
} = configOxlint;

const require = createRequire(import.meta.url);

const PRESETS = { base: baseOxlintConfig, monorepo: monorepoOxlintConfig };

const oxlintRuleNames = () => {
  const schemaPath = path.join(path.dirname(require.resolve('oxlint/package.json')), 'configuration_schema.json');
  return new Set(Object.keys(JSON.parse(fs.readFileSync(schemaPath, 'utf8')).definitions.DummyRuleMap.properties));
};

const rulesOf = config => [
  ...Object.keys(config.rules ?? {}),
  ...(config.overrides ?? []).flatMap(override => Object.keys(override.rules ?? {})),
];

describe.each(Object.entries(PRESETS))('%s preset', (_, config) => {
  const jsPluginNames = config.jsPlugins.map(plugin => plugin.name);

  it('loads every JS plugin from an existing absolute path', () => {
    for (const { specifier } of config.jsPlugins) {
      expect(path.isAbsolute(specifier)).toBe(true);
      expect(fs.existsSync(specifier)).toBe(true);
    }
  });

  it('JS plugins define every rule the preset enables', async () => {
    const pluginRules = Object.fromEntries(
      await Promise.all(
        config.jsPlugins.map(async ({ name, specifier }) => {
          const plugin = await import(pathToFileURL(specifier).href);
          return [name, Object.keys((plugin.default ?? plugin).rules)];
        }),
      ),
    );
    const undefinedRules = rulesOf(config).filter(name => {
      const plugin = jsPluginNames.find(pluginName => name.startsWith(`${pluginName}/`));
      return plugin && !pluginRules[plugin].includes(name.slice(plugin.length + 1));
    });
    expect(undefinedRules).toEqual([]);
  });

  it('every native rule exists in Oxlint', () => {
    const known = oxlintRuleNames();
    const unknown = rulesOf(config).filter(
      name => !jsPluginNames.some(pluginName => name.startsWith(`${pluginName}/`)) && !known.has(name),
    );
    expect(unknown).toEqual([]);
  });

  it('enables only plugins it needs (no `import`: it builds the whole module graph)', () => {
    expect(config.plugins).toEqual(['eslint', 'typescript', 'react', 'jsx-a11y', 'vitest']);
  });

  it('turns off vitest rules that fire on Playwright tests', () => {
    expect(config.rules['vitest/no-conditional-in-test']).toBeUndefined();
    expect(config.overrides).toContainEqual(
      playwrightTestsOxlintOverride(['tests/**/*', '**/*.e2e.ts', '**/*.e2e.js', '**/*.smoke.ts', '**/*.smoke.js']),
    );
  });
});

describe('monorepo preset', () => {
  it('exports the Oxlint config file name', () => {
    expect(defaultOxlintConfigRelativePath).toBe('oxlint.config.mts');
  });

  it('extends the base preset', () => {
    expect(monorepoOxlintConfig.rules).toEqual(baseOxlintConfig.rules);
    expect(monorepoOxlintConfig.overrides.slice(0, baseOxlintConfig.overrides.length)).toEqual(
      baseOxlintConfig.overrides,
    );
  });

  it('allows console in scripts', () => {
    expect(monorepoOxlintConfig.overrides).toContainEqual({
      files: ['scripts/**/*.ts', 'scripts/**/*.mts'],
      rules: { 'no-console': 'off' },
    });
  });
});

describe('playwrightTestsOxlintOverride', () => {
  it('turns off every vitest rule of the base preset except import and comment checks', () => {
    const { files, rules } = playwrightTestsOxlintOverride(['e2e/**/*']);
    const vitestRules = Object.keys(baseOxlintConfig.rules).filter(name => name.startsWith('vitest/'));
    expect(files).toEqual(['e2e/**/*']);
    expect(Object.keys(rules).sort()).toEqual(
      vitestRules
        .filter(
          name =>
            !['vitest/no-commented-out-tests', 'vitest/no-import-node-test', 'vitest/no-mocks-import'].includes(name),
        )
        .sort(),
    );
    expect(new Set(Object.values(rules))).toEqual(new Set(['off']));
  });
});

describe('mergeOxlintConfigs', () => {
  it('merges rules, env, globals and categories key by key', () => {
    expect(
      mergeOxlintConfigs(
        {
          rules: { a: 'error', b: 'warn' },
          env: { browser: true },
          globals: { x: 'readonly' },
          categories: { style: 'off' },
        },
        {
          rules: { b: 'off', c: ['error', {}] },
          env: { node: true },
          globals: { y: 'writable' },
          categories: { perf: 'warn' },
        },
      ),
    ).toEqual({
      rules: { a: 'error', b: 'off', c: ['error', {}] },
      env: { browser: true, node: true },
      globals: { x: 'readonly', y: 'writable' },
      categories: { style: 'off', perf: 'warn' },
    });
  });

  it('merges object settings one level deep and replaces the rest', () => {
    expect(
      mergeOxlintConfigs(
        { settings: { react: { version: '18' }, 'import/extensions': ['.ts'] } },
        { settings: { react: { linkComponents: ['Link'] }, 'import/extensions': ['.tsx'] } },
      ),
    ).toEqual({
      settings: { react: { version: '18', linkComponents: ['Link'] }, 'import/extensions': ['.tsx'] },
    });
  });

  it('unites plugins and ignore patterns, concatenates overrides', () => {
    expect(
      mergeOxlintConfigs(
        { plugins: ['eslint', 'react'], ignorePatterns: ['dist'], overrides: [{ files: ['a'], rules: {} }] },
        { plugins: ['react', 'vitest'], ignorePatterns: ['dist', 'build'], overrides: [{ files: ['b'], rules: {} }] },
      ),
    ).toEqual({
      plugins: ['eslint', 'react', 'vitest'],
      ignorePatterns: ['dist', 'build'],
      overrides: [
        { files: ['a'], rules: {} },
        { files: ['b'], rules: {} },
      ],
    });
  });

  it('keeps one JS plugin per name, the last one wins', () => {
    expect(
      mergeOxlintConfigs(
        { jsPlugins: [{ name: 'a', specifier: '/a1' }, 'plain'] },
        { jsPlugins: [{ name: 'a', specifier: '/a2' }, { name: 'b', specifier: '/b' }, 'plain'] },
      ).jsPlugins,
    ).toEqual([{ name: 'a', specifier: '/a2' }, 'plain', { name: 'b', specifier: '/b' }]);
  });

  it('skips empty configs and undefined values, replaces other keys', () => {
    expect(
      mergeOxlintConfigs(
        undefined,
        null,
        false,
        { $schema: 'a', rules: { a: 'error' } },
        { $schema: 'b', rules: undefined },
      ),
    ).toEqual({
      $schema: 'b',
      rules: { a: 'error' },
    });
  });

  it('does not mutate its arguments', () => {
    const first = { rules: { a: 'error' }, overrides: [{ files: ['a'], rules: {} }] };
    const snapshot = JSON.stringify(first);
    mergeOxlintConfigs(first, { rules: { b: 'error' }, overrides: [{ files: ['b'], rules: {} }] });
    expect(JSON.stringify(first)).toBe(snapshot);
  });
});
