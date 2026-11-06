# `@cloud-ru/ft-config-oxlint`

> Установка: вместе с `@cloud-ru/ft-all-linters-pack` (**≥ 1.2.0**) или `npm i @cloud-ru/ft-config-oxlint`.
>
> Вместе с пакетом приезжают `oxlint` и общие пресеты — замена `@cloud-ru/eslint-config` с тем же набором правил.
> Добавлять `oxlint` и eslint-плагины в приложение не нужно.

## Usage

```typescript
// projectRoot/oxlint.config.mts
import { defineConfig } from 'oxlint';

import { baseOxlintConfig } from '@cloud-ru/ft-all-linters-pack';

export default defineConfig(baseOxlintConfig);
```

| Пресет | Замена для |
|---|---|
| `baseOxlintConfig` | `@cloud-ru/eslint-config` |
| `monorepoOxlintConfig` | `@cloud-ru/eslint-config/monorepo`, `@cloud-ru/eslint-config/monorepo-oxfmt` |

Проектные правила добавляются через `mergeOxlintConfigs`:

```typescript
import { defineConfig } from 'oxlint';

import { mergeOxlintConfigs, monorepoOxlintConfig } from '@cloud-ru/ft-all-linters-pack';

export default defineConfig(
  mergeOxlintConfigs(monorepoOxlintConfig, {
    ignorePatterns: ['**/dist/**'],
    rules: { 'no-nested-ternary': 'off' },
  }),
);
```

Для Playwright-тестов `playwrightTestsOxlintOverride(['tests/**/*'])` отключает vitest-правила, которые срабатывают на `test.describe`/`expect` из Playwright.

## Миграция с ESLint

### 1. Установить CLI

Bin **`migrate-to-oxlint`** находится в `@cloud-ru/ft-all-linters-pack` (**≥ 1.2.0**):

```bash
cd /path/to/your-repo
pnpm add -D @cloud-ru/ft-all-linters-pack@^1.2.0
pnpm install
```

### 2. Запустить из корня репозитория

```bash
pnpm exec migrate-to-oxlint
```

Предпросмотр без записи файлов: `pnpm exec migrate-to-oxlint --dry-run`.

### 3. Проверить линтер

```bash
pnpm run lint:oxlint
pnpm run lint:oxlint:fix
```

### Что меняет `migrate-to-oxlint`

Сначала, если в проекте ещё нет `oxfmt.config.mts`, переводит форматирование с Prettier на oxfmt — так же, как
[`migrate-to-oxfmt`](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-oxfmt)
(конфиг oxfmt, scripts `lint:fmt`, удаление Prettier, настройки VS Code), но без правки `eslint.config.*`: его заменяет `oxlint.config.mts`.
Отдельно перейти только на oxfmt по-прежнему можно через `migrate-to-oxfmt`.

Создаёт `oxlint.config.mts`: пресет выбирается по `eslint.config.*` (`@cloud-ru/eslint-config` → `baseOxlintConfig`,
`@cloud-ru/eslint-config/monorepo*` → `monorepoOxlintConfig`), проектные правила, overrides, плагины и ignores переносятся из ESLint-конфига
и `.eslintignore`. Правила без аналога в Oxlint пропускаются и перечисляются в комментарии конфига. `eslint.config.*` и `.eslintignore` удаляются.

```typescript
// oxlint.config.mts — пресет + проектные правила, overrides и ignores из ESLint-конфига
import { defineConfig } from 'oxlint';

import { monorepoOxlintConfig } from '@cloud-ru/ft-all-linters-pack';

export default defineConfig(monorepoOxlintConfig);
```

Переключает lint-staged на `defaultLintStagedConfigWithOxlintAndOxfmt`:

```javascript
// lint-staged.config.js
module.exports = require('@cloud-ru/ft-all-linters-pack').defaultLintStagedConfigWithOxlintAndOxfmt;
```

Добавляет scripts `lint:oxlint` и `lint:oxlint:fix` (цели берутся из ESLint-скрипта, например `eslint ./src` → `oxlint ./src`).
Остальные scripts не меняются — скрипт перечисляет те, что ещё вызывают ESLint (например, `lint:es` в `lint:all`, их стоит отредактировать самостоятельно),
и ESLint-пакеты, которые можно удалить из `package.json`.

```json
{
  "scripts": {
    "lint:oxlint": "oxlint .",
    "lint:oxlint:fix": "oxlint --fix ."
  }
}
```

## Что внутри

Пресеты собраны по фактическому конфигу ESLint (`eslint --print-config`): нативные правила Oxlint плюс JS-плагины, которые пакет подключает сам:

| JS-плагин | Зачем |
|---|---|
| `import-js` (`src/plugins/import-js`) | `no-dynamic-require` вместо правила eslint-plugin-import |
| `eslint-plugin-simple-import-sort` | порядок импортов (группы как в ESLint) |

## Компромиссы относительно ESLint

| Что | Как сейчас |
|---|---|
| `@typescript-eslint/no-deprecated` (type-aware) | не перенесли. Нужен oxlint `tsgolint`, добавим после перехода на TS7 |
| `prettier/prettier`, `no-only-tests/no-only-tests` | не переносятся: форматирование — oxfmt/Prettier, `.only` ловит `vitest/no-focused-tests` |
| Нативный плагин `import` не включён | Как только он включён, Oxlint строит полный граф модулей, и прогон замедляется в разы даже без единого правила `import/*`. Замены: `import/no-default-export` → `no-restricted-exports` (те же проверки), `import/no-dynamic-require` → `import-js/no-dynamic-require`. `import/default` проверяет TypeScript (TS1192). Не перенесены `import/no-named-as-default(-member)` (warnings) и `import/export` (дубли экспортов ловит `tsc`) |

### Настройка VS Code / Cursor

1. Установить [Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode).
2. Отключить расширение ESLint для workspace (Extensions → ESLint → Disable (Workspace)).
3. Reload window.
4. `.vscode/settings.json`, минимум:

```jsonc
{
  "eslint.enable": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "always"
  }
}
```

5. Проверка: ошибка в `.ts` подсвечивается так же, как в `pnpm run lint:oxlint`.

### Настройка WebStorm

1. **Settings → Plugins** → [Oxc](https://plugins.jetbrains.com/plugin/27076-oxc) → Install → Restart IDE.
2. **Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint** → *Disable ESLint configuration*.
3. **Settings → Tools → Oxlint** → *Automatic Oxlint configuration*. Если нужна ручная настройка:
   - *Path to Oxlint Language Server*: `<project>/node_modules/.bin/oxlint`;
   - включить **Add --lsp CLI argument** — без него запускается обычный CLI и IDE пишет «StdIO connection closed»;
   - *Path to Oxlint Config* оставить пустым — конфиг найдётся сам.
4. Там же — *Run 'Fix All' on Save*, если нужен автофикс при сохранении.
5. **Settings → Languages & Frameworks → Node.js** — интерпретатор ≥ 22.18.
