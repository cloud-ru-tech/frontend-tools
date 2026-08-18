/**
 * Разворачивает pnpm-специфаеры `catalog:` в конкретные диапазоны из
 * `pnpm-workspace.yaml` во всех манифестах `packages`.
 *
 * Зачем: lerna не знает про протокол `catalog:` — в её коде публикации нет ни
 * одного упоминания (в отличие от `workspace:`, который она разворачивает сама
 * через `resolveWorkspaceDependencyLinks`). Без этого шага в реестр уедет
 * буквальный `"catalog:"`, и потребитель получит EUNSUPPORTEDPROTOCOL (npm) или
 * ERR_PNPM_SPEC_NOT_SUPPORTED_BY_ANY_RESOLVER (pnpm).
 *
 * Запускается в CI между сборкой и `lerna publish`. Значения `workspace:*` не
 * трогает — их разворачивает lerna. Скрипт идемпотентен.
 *
 * Написан на голом Node ESM намеренно: он должен работать до любой сборки и без
 * транспилятора в цепочке публикации.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES_DIR = join(ROOT, 'packages');
const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

/**
 * Мини-парсер секции `catalog:` из pnpm-workspace.yaml. Полноценный YAML здесь не
 * нужен: секция — плоская карта `имя: диапазон`, а тянуть зависимость в скрипт,
 * который запускается до установки, не хочется.
 *
 * @returns {Map<string, string>}
 */
function readCatalog() {
  const source = readFileSync(join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
  const lines = source.split('\n');
  const startIndex = lines.findIndex(line => /^catalog\s*:\s*$/.test(line));

  if (startIndex === -1) {
    return new Map();
  }

  const catalog = new Map();

  for (const line of lines.slice(startIndex + 1)) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    // Первая же строка без отступа — начало следующей секции верхнего уровня.
    if (!/^\s/.test(line)) break;

    const match = line.match(/^\s+['"]?([^'":]+?)['"]?\s*:\s*['"]?([^'"#]+?)['"]?\s*$/);
    if (match) {
      catalog.set(match[1], match[2]);
    }
  }

  return catalog;
}

/**
 * @param {string} depName имя зависимости (ключ в dependencies)
 * @param {string} spec значение специфаера
 * @param {Map<string, string>} catalog
 * @param {string} pkgName имя пакета — для сообщения об ошибке
 * @returns {string}
 */
function resolveCatalogSpec(depName, spec, catalog, pkgName) {
  const alias = spec.slice('catalog:'.length);

  if (alias !== '' && alias !== 'default') {
    throw new Error(
      `${pkgName}: именованные каталоги не поддерживаются (${depName}: ${spec}). ` +
        'Используй catalog: или catalog:default.',
    );
  }

  const range = catalog.get(depName);

  if (!range) {
    throw new Error(
      `${pkgName}: ${depName} объявлен как ${spec}, но записи ${depName} нет в pnpm-workspace.yaml::catalog.`,
    );
  }

  return range;
}

function main() {
  const catalog = readCatalog();
  const slugs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  let resolvedCount = 0;

  for (const slug of slugs) {
    const manifestPath = join(PACKAGES_DIR, slug, 'package.json');
    let source;

    try {
      source = readFileSync(manifestPath, 'utf8');
    } catch {
      continue;
    }

    const manifest = JSON.parse(source);
    let changed = false;

    for (const field of DEP_FIELDS) {
      const deps = manifest[field];
      if (!deps) continue;

      for (const [depName, spec] of Object.entries(deps)) {
        if (typeof spec !== 'string' || !spec.startsWith('catalog:')) continue;

        // peer-диапазоны намеренно шире, чем версия для локальной сборки: каталог
        // держит одну версию (например react 18.2.0), а peer должен допускать всё,
        // что пакет реально поддерживает (^17.0.2 || ^18.0.0). Через catalog: peer
        // схлопнулся бы в точную версию и потребитель не смог бы поставить пакет.
        if (field === 'peerDependencies') {
          throw new Error(
            `${manifest.name ?? slug}: peerDependencies.${depName} = ${spec}. ` +
              'В peerDependencies catalog: использовать нельзя — укажи диапазон явно.',
          );
        }

        deps[depName] = resolveCatalogSpec(depName, spec, catalog, manifest.name ?? slug);
        changed = true;
        resolvedCount += 1;
      }
    }

    if (changed) {
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      console.info(`resolved catalog specs in ${manifest.name ?? slug}`);
    }
  }

  console.info(`prepublish-resolve: развёрнуто специфаеров — ${resolvedCount}`);
}

main();
