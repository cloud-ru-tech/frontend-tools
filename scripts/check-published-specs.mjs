/**
 * Гард перед публикацией: падает, если в манифесте пакета остался
 * специфаер, который потребитель не сможет разрешить.
 *
 * Проверяются `dependencies`, `peerDependencies`, `optionalDependencies` —
 * то, что реально ставится на стороне потребителя. `devDependencies` в
 * опубликованном пакете никто не устанавливает, поэтому они не проверяются.
 *
 * `catalog:` — ошибка: его должен был развернуть scripts/prepublish-resolve.mjs.
 * `workspace:` — не ошибка: его разворачивает сама lerna при упаковке тарбола.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES_DIR = join(ROOT, 'packages');
const DEP_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'];

const slugs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

const problems = [];

for (const slug of slugs) {
  let source;

  try {
    source = readFileSync(join(PACKAGES_DIR, slug, 'package.json'), 'utf8');
  } catch {
    continue;
  }

  const manifest = JSON.parse(source);

  for (const field of DEP_FIELDS) {
    const deps = manifest[field];
    if (!deps) continue;

    for (const [depName, spec] of Object.entries(deps)) {
      if (typeof spec === 'string' && spec.startsWith('catalog:')) {
        problems.push(`${manifest.name ?? slug} → ${field}.${depName} = "${spec}"`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error('Неразрешённые catalog:-специфаеры в публикуемых зависимостях:');
  problems.forEach(problem => console.error(`  ${problem}`));
  console.error('\nЗапусти `pnpm run publish:resolve-specs` перед публикацией.');
  process.exit(1);
}

console.info('check-published-specs: неразрешённых специфаеров нет');
