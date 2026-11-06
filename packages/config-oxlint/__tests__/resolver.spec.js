import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

import resolver from '../src/plugins/boundaries/resolver.js';
import { createProject } from './helpers.js';

const { resolveImport } = resolver;

describe('resolveImport', () => {
  const project = createProject({
    'tsconfig.base.json': `{
      // comments and trailing commas, as tsconfig allows
      "compilerOptions": {
        "baseUrl": ".",
        /* block comment with "quotes" */
        "paths": {
          "@/*": ["./src/*"],
          "@components/*": ["./missing/*", "./src/components/*"],
          "#config": ["./src/config.ts"],
        },
      },
    }`,
    'tsconfig.json': { extends: './tsconfig.base', compilerOptions: { strict: true } },
    'src/index.ts': '',
    'src/config.ts': '',
    'src/app/index.tsx': '',
    'src/app/App.tsx': '',
    'src/components/Button/index.ts': '',
    'src/components/Button/helpers.ts': '',
    'src/components/Card/Card.tsx': '',
    'src/components/Card/index.ts': '',
    'src/utils/format.ts': '',
    'src/utils/$&-$1.ts': '',
    'src/utils/legacy.js': '',
    'src/utils/esm.mjs': '',
    'src/types.d.ts': '',
    'src/assets/logo.svg': '',
    'src/data/items.json': '{}',
  });
  afterAll(project.remove);

  const resolve = (source, importer = 'src/app/App.tsx') => resolveImport(source, project.file(importer), project.root);
  const relativeTo = filePath => filePath && path.relative(project.root, filePath);

  it.each([
    ['./index', 'src/app/index.tsx'],
    ['.', 'src/app/index.tsx'],
    ['../components/Button', 'src/components/Button/index.ts'],
    ['../components/Button/helpers', 'src/components/Button/helpers.ts'],
    ['../components/Card/Card', 'src/components/Card/Card.tsx'],
    ['../utils/format.js', 'src/utils/format.ts'],
    ['../utils/legacy', 'src/utils/legacy.js'],
    ['../utils/esm.mjs', 'src/utils/esm.mjs'],
    ['../types', 'src/types.d.ts'],
    ['../assets/logo.svg', 'src/assets/logo.svg'],
    ['../assets/logo.svg?react', 'src/assets/logo.svg'],
    ['../data/items.json', 'src/data/items.json'],
  ])('relative %s', (source, expected) => {
    expect(relativeTo(resolve(source))).toBe(expected);
  });

  it.each([
    ['@/utils/format', 'src/utils/format.ts'],
    ['@/components/Button', 'src/components/Button/index.ts'],
    ['@components/Card', 'src/components/Card/index.ts'],
    ['#config', 'src/config.ts'],
    ['src/utils/format', 'src/utils/format.ts'],
    ['@/utils/$&-$1', 'src/utils/$&-$1.ts'],
  ])('tsconfig paths / baseUrl %s', (source, expected) => {
    expect(relativeTo(resolve(source))).toBe(expected);
  });

  it.each(['react', '@cloud-ru/spa-core/bootstrap', './missing', '@/missing', '#unknown'])(
    'does not resolve %s',
    source => {
      expect(resolve(source)).toBeNull();
    },
  );
});

describe('resolveImport: tsconfig lookup', () => {
  const resolveIn = (files, source) => {
    const project = createProject({ 'src/index.ts': '', 'src/lib/a.ts': '', 'other/lib/a.ts': '', ...files });
    const relative = filePath => filePath && path.relative(project.root, filePath);
    try {
      return relative(resolveImport(source, project.file('src/index.ts'), project.root));
    } finally {
      project.remove();
    }
  };

  it('uses the longest matching paths prefix', () => {
    const tsconfig = { compilerOptions: { paths: { '@/*': ['./other/*'], '@/lib/*': ['./src/lib/*'] } } };
    expect(resolveIn({ 'tsconfig.json': tsconfig }, '@/lib/a')).toBe('src/lib/a.ts');
  });

  it('resolves paths relative to the tsconfig that declares them, without baseUrl', () => {
    const files = {
      'tsconfig.json': { extends: './configs/tsconfig.paths.json' },
      'configs/tsconfig.paths.json': { compilerOptions: { paths: { '~/*': ['../src/*'] } } },
    };
    expect(resolveIn(files, '~/lib/a')).toBe('src/lib/a.ts');
  });

  it('resolves inherited paths against the inherited baseUrl', () => {
    const files = {
      'tsconfig.json': { extends: './configs/base.json' },
      'configs/base.json': { compilerOptions: { baseUrl: '..', paths: { '~/*': ['src/*'] } } },
    };
    expect(resolveIn(files, '~/lib/a')).toBe('src/lib/a.ts');
  });

  it('resolves inherited paths against own baseUrl', () => {
    const files = {
      'tsconfig.json': { extends: './configs/base.json', compilerOptions: { baseUrl: './src' } },
      'configs/base.json': { compilerOptions: { paths: { '~/*': ['./*'] } } },
    };
    expect(resolveIn(files, '~/lib/a')).toBe('src/lib/a.ts');
  });

  it('follows extends of a package with the `tsconfig` field', () => {
    const files = {
      'tsconfig.json': { extends: '@test/tsconfig', compilerOptions: { baseUrl: '.' } },
      'node_modules/@test/tsconfig/package.json': { name: '@test/tsconfig', tsconfig: './base.json' },
      'node_modules/@test/tsconfig/base.json': { compilerOptions: { paths: { '~/*': ['src/*'] } } },
    };
    expect(resolveIn(files, '~/lib/a')).toBe('src/lib/a.ts');
  });

  it('follows extends of a package with tsconfig.json in its root', () => {
    const files = {
      'tsconfig.json': { extends: '@test/tsconfig', compilerOptions: { baseUrl: '.' } },
      'node_modules/@test/tsconfig/package.json': { name: '@test/tsconfig' },
      'node_modules/@test/tsconfig/tsconfig.json': { compilerOptions: { paths: { '~/*': ['src/*'] } } },
    };
    expect(resolveIn(files, '~/lib/a')).toBe('src/lib/a.ts');
  });

  it('supports an array of extends, the last one wins', () => {
    const files = {
      'tsconfig.json': { extends: ['./a.json', './b.json'] },
      'a.json': { compilerOptions: { paths: { '~/*': ['./other/*'] } } },
      'b.json': { compilerOptions: { paths: { '~/*': ['./src/*'] } } },
    };
    expect(resolveIn(files, '~/lib/a')).toBe('src/lib/a.ts');
  });

  it('own paths override inherited ones', () => {
    const files = {
      'tsconfig.json': { extends: './base.json', compilerOptions: { paths: { '~/*': ['./src/*'] } } },
      'base.json': { compilerOptions: { paths: { '~/*': ['./other/*'] } } },
    };
    expect(resolveIn(files, '~/lib/a')).toBe('src/lib/a.ts');
  });

  it('keeps `//` inside strings of tsconfig', () => {
    const tsconfig = '{ "compilerOptions": { "paths": { "http://*": ["./src/*"] } } }';
    expect(resolveIn({ 'tsconfig.json': tsconfig }, 'http://lib/a')).toBe('src/lib/a.ts');
  });

  it('survives cyclic extends', () => {
    const files = {
      'tsconfig.json': { extends: './a.json' },
      'a.json': { extends: './tsconfig.json', compilerOptions: { paths: { '~/*': ['./src/*'] } } },
    };
    expect(resolveIn(files, '~/lib/a')).toBe('src/lib/a.ts');
  });

  it('resolves only relative imports without tsconfig', () => {
    expect(resolveIn({}, './lib/a')).toBe('src/lib/a.ts');
    expect(resolveIn({}, '~/lib/a')).toBeNull();
  });

  it('ignores a broken tsconfig', () => {
    expect(resolveIn({ 'tsconfig.json': '{ broken' }, './lib/a')).toBe('src/lib/a.ts');
  });
});

describe('resolveImport: cache', () => {
  it('sees files created after the cache expires', () => {
    const project = createProject({ 'src/index.ts': '' });
    const realNow = Date.now;
    try {
      const resolve = () => resolveImport('./later', project.file('src/index.ts'), project.root);
      expect(resolve()).toBeNull();
      project.write('src/later.ts', '');
      expect(resolve()).toBeNull();
      const now = realNow();
      Date.now = () => now + 10_000;
      expect(resolve()).toBe(project.file('src/later.ts'));
    } finally {
      Date.now = realNow;
      project.remove();
    }
  });
});
