# `@cloud-ru/ft-config-oxfmt`

> Установка: `npm i @cloud-ru/ft-config-oxfmt`
>
> Вместе с пакетом приезжает `oxfmt` и общий конфиг форматирования.

## Usage

```typescript
// projectRoot/oxfmt.config.mts
import { defineConfig } from 'oxfmt';

import { defaultOxfmtConfig } from '@cloud-ru/ft-all-linters-pack';

export default defineConfig(defaultOxfmtConfig);
```

В preset уже **`ignorePatterns`**: `.cursor`, `.claude`, `pnpm-lock.yaml`, `CHANGELOG.md`. Свой список **заменяет** preset (не merge):

```typescript
export default defineConfig({
  ...defaultOxfmtConfig,
  ignorePatterns: ['pnpm-lock.yaml', 'definition.yaml'],
});
```

Oxfmt autodiscover подхватывает `oxfmt.config.mts` в корне:

```json
{
  "scripts": {
    "lint:fmt": "oxfmt --check .",
    "lint:fmt:fix": "oxfmt --write ."
  }
}
```

## Миграция с Prettier

### 1. Установить CLI

Bin **`migrate-to-oxfmt`** находится в `@cloud-ru/ft-all-linters-pack` (**≥ 1.0.17**):

```bash
cd /path/to/your-repo
pnpm add -D @cloud-ru/ft-all-linters-pack@^1.0.17
pnpm install
```

### 2. Запустить из корня репозитория

```bash
pnpm exec migrate-to-oxfmt
```

### 3. Проверить форматер

```bash
pnpm run lint:fmt
pnpm run lint:fmt:fix
```


### Что меняет `migrate-to-oxfmt`

```typescript
// oxfmt.config.mts
import { defineConfig } from 'oxfmt';

import { defaultOxfmtConfig } from '@cloud-ru/ft-all-linters-pack';

export default defineConfig(defaultOxfmtConfig);
```

```typescript
// eslint.config.mjs
import config from '@cloud-ru/eslint-config/monorepo-oxfmt';

export default config;
```

```javascript
// lint-staged.config.js
module.exports = require('@cloud-ru/ft-all-linters-pack').defaultLintStagedConfigWithOxfmt;
```

```json
{
  "scripts": {
    "lint:fmt": "oxfmt --check .",
    "lint:fmt:fix": "oxfmt --write ."
  }
}
```

## IDE

CLI `oxfmt` ≠ format on save в редакторе. Нужны:

1. Расширение/плагин **Oxc** ([VS Code / Cursor](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode), [JetBrains](https://plugins.jetbrains.com/plugin/27076-oxc)).
2. `oxfmt.config.mts` в корне (autodiscover).
3. Default formatter = Oxc, format on save, **Prettier отключён** для JS/TS/JSON.

После migrate и установки плагинов имеет смысл **перезапустить ESLint server** (Command Palette → «ESLint: Restart ESLint Server»), чтобы подхватился `monorepo-oxfmt`.

### VS Code / Cursor

1. Установить [Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) (или Recommended Extensions после migrate).
2. Reload window.
3. Проверить `.vscode/settings.json` (migrate дополняет). Минимум:

```jsonc
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "[typescript]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "prettier.enable": false
}
```

4. В user settings отключить Prettier как formatter для JS/TS, если save расходится с CI.
5. Проверка: Save в `.ts` = `pnpm exec oxfmt --write path/to/file`.

Если `.vscode` в gitignore — скопируйте настройки в user/workspace. ESLint fix on save: [oxc-vscode](https://github.com/oxc-project/oxc-vscode#oxfmt).

### WebStorm / IDEA

1. **Settings → Plugins** → [Oxc](https://plugins.jetbrains.com/plugin/27076-oxc) → Install → Restart IDE.
2. **Settings → Languages & Frameworks → JavaScript → Prettier** — выключить *On save* / *Run on save* для проекта.
3. **Settings → Tools → Actions on Save** — включить reformat/format через **Oxc** (не Prettier).

### Если что-то не так

| Проблема                     | Проверить |
|------------------------------|-----------|
| Save не форматирует          | Oxc установлен, `formatOnSave`, formatter `oxc.oxc-vscode` |
| Save ≠ CI                    | Prettier всё ещё formatter |
| Нет конфига                  | `oxfmt.config.mts` в корне, открыт корень репо |
| ESLint на `oxfmt.config.mts` | `@cloud-ru/eslint-config/monorepo-oxfmt` |
| ESLint «не видит» новый конфиг | Restart ESLint Server |
