import { afterAll, describe, expect, it } from 'vitest';

import configOxlint from '../src/index.js';
import boundaries from '../src/plugins/boundaries/index.js';
import { ast, createProject, runRule } from './helpers.js';

describe('boundariesJsPlugin', () => {
  it('points to the boundaries plugin', async () => {
    const { name, specifier } = configOxlint.boundariesJsPlugin;
    const plugin = await import(specifier);
    expect(name).toBe('boundaries');
    expect(Object.keys((plugin.default ?? plugin).rules).sort()).toEqual([
      'element-types',
      'entry-point',
      'no-private',
      'no-unknown',
      'no-unknown-files',
    ]);
  });
});

describe('boundaries rule options', () => {
  const project = createProject({
    'src/features/auth/index.ts': '',
    'src/features/auth/model.ts': '',
    'src/features/cart/index.ts': '',
    'src/shared/ui.ts': '',
    'src/shared/ignored.ts': '',
  });
  afterAll(project.remove);

  const settings = {
    'boundaries/root-path': project.root,
    'boundaries/include': ['src/**/*'],
    'boundaries/ignore': ['src/shared/ignored.ts'],
    'boundaries/elements': [
      { type: 'feature', pattern: 'features/*', mode: 'folder', capture: ['name'] },
      { type: 'shared', pattern: 'shared/*', mode: 'file' },
    ],
  };
  const check = (ruleName, options, filename, nodes, extraSettings = {}) =>
    runRule(
      boundaries.rules[ruleName],
      { filename: project.file(filename), settings: { ...settings, ...extraSettings }, options: [options] },
      nodes,
    ).map(({ message }) => message);
  const imports = (...sources) => sources.map(source => ast.import(source));

  it('applies the last matching rule', () => {
    const options = {
      default: 'allow',
      rules: [
        { from: 'feature', allow: ['feature'] },
        { from: 'feature', disallow: ['feature'] },
      ],
    };
    expect(check('element-types', options, 'src/features/auth/index.ts', imports('../cart'))).toEqual([
      "Importing elements of type 'feature' is not allowed in elements of type 'feature'. Disallowed in rule 2",
    ]);
  });

  it('falls back to the default policy and describes captured values', () => {
    expect(check('element-types', { default: 'disallow' }, 'src/features/auth/index.ts', imports('../cart'))).toEqual([
      "No rule allowing this dependency was found. File is of type 'feature' with name 'auth'. Dependency is of type 'feature' with name 'cart'",
    ]);
    expect(check('element-types', { default: 'allow' }, 'src/features/auth/index.ts', imports('../cart'))).toEqual([]);
  });

  it('matches captured values in selectors', () => {
    const options = {
      default: 'disallow',
      rules: [{ from: 'feature', allow: [['feature', { name: 'cart' }], 'shared'] }],
    };
    expect(
      check('element-types', options, 'src/features/auth/index.ts', imports('../cart', '../../shared/ui')),
    ).toEqual([]);
    expect(check('element-types', options, 'src/features/cart/index.ts', imports('../auth'))).toHaveLength(1);
  });

  it('fills message templates', () => {
    const options = {
      default: 'disallow',
      message: '${file.type}:${file.name} → ${dependency.type}:${dependency.name} (${from.type} → ${target.type})',
    };
    expect(check('element-types', options, 'src/features/auth/index.ts', imports('../cart'))).toEqual([
      'feature:auth → feature:cart (feature → feature)',
    ]);
  });

  it('prefers the message of the matching rule', () => {
    const options = {
      default: 'allow',
      message: 'default',
      rules: [{ from: 'shared', disallow: ['feature'], message: 'shared is a leaf' }],
    };
    expect(check('element-types', options, 'src/shared/ui.ts', imports('../features/auth'))).toEqual([
      'shared is a leaf',
    ]);
  });

  it('checks only imports by default and other dependency nodes when enabled', () => {
    const nodes = [
      ast.exportFrom('../cart', ['a']),
      ast.exportAll('../cart'),
      ast.dynamicImport('../cart'),
      ast.call(ast.identifier('require'), [ast.literal('../cart')]),
    ];
    expect(check('element-types', { default: 'disallow' }, 'src/features/auth/index.ts', nodes)).toEqual([]);
    expect(
      check('element-types', { default: 'disallow' }, 'src/features/auth/index.ts', nodes, {
        'boundaries/dependency-nodes': ['import', 'export', 'dynamic-import', 'require'],
      }),
    ).toHaveLength(4);
  });

  it('ignores files and dependencies from boundaries/ignore', () => {
    expect(
      check('element-types', { default: 'disallow' }, 'src/shared/ignored.ts', imports('../features/auth')),
    ).toEqual([]);
    expect(check('no-unknown', {}, 'src/features/auth/index.ts', imports('../../shared/ignored'))).toEqual([]);
  });

  it('entry-point: allows entry points matching a rule', () => {
    const options = {
      default: 'disallow',
      rules: [
        { target: ['feature'], allow: 'index.ts' },
        { target: [['feature', { name: 'auth' }]], allow: 'model.ts' },
      ],
    };
    expect(check('entry-point', options, 'src/features/cart/index.ts', imports('../auth', '../auth/model'))).toEqual(
      [],
    );
    expect(check('entry-point', options, 'src/shared/ui.ts', imports('../features/cart/index.ts'))).toEqual([]);
  });

  it('entry-point: reports when no rule allows the entry point', () => {
    const options = { default: 'disallow', rules: [{ target: ['feature'], allow: 'index.ts' }] };
    expect(check('entry-point', options, 'src/shared/ui.ts', imports('../features/auth/model'))).toEqual([
      "No rule allows the entry point 'model.ts' in dependencies of type 'feature' with name 'auth'",
    ]);
  });

  it('no-private: allowUncles', () => {
    const nested = createProject({
      'src/features/auth/index.ts': '',
      'src/features/auth/features/login/index.ts': '',
      'src/features/auth/features/logout/features/button/index.ts': '',
    });
    try {
      const run = options =>
        runRule(
          boundaries.rules['no-private'],
          {
            filename: nested.file('src/features/auth/features/logout/features/button/index.ts'),
            settings: { ...settings, 'boundaries/root-path': nested.root },
            options: [options],
          },
          imports('../../../login'),
        ).map(({ message }) => message);
      expect(run({ allowUncles: true })).toEqual([]);
      expect(run({ allowUncles: false })).toEqual([
        "Dependency is private of element of type 'feature' with name 'auth'",
      ]);
    } finally {
      nested.remove();
    }
  });

  it('reports on the import source', () => {
    const node = ast.import('../cart');
    const [report] = runRule(
      boundaries.rules['element-types'],
      { filename: project.file('src/features/auth/index.ts'), settings, options: [{ default: 'disallow' }] },
      [node],
    );
    expect(report.node).toBe(node.source);
  });
});
