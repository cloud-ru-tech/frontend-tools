# `@cloud-ru/ft-all-linters-pack`

Набор конфигов для husky, lint-staged, eslint, stylelint, Prettier / oxfmt:

| Пакет | Назначение |
|-------|------------|
| [ft-config-husky](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-husky) | git hooks |
| [ft-config-lint-staged](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-lint-staged) | pre-commit |
| [eslint-config](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/eslint-config) | ESLint |
| [ft-config-prettier](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-prettier) | Prettier (legacy) |
| [ft-config-oxfmt](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-oxfmt) | oxfmt, CLI scripts |
| [ft-config-stylelint](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-stylelint) | SCSS |

## Usage

#### eslint.config.mjs
```typescript
import monorepoEslintConfig from '@cloud-ru/eslint-config/monorepo';

export default monorepoEslintConfig;
```

#### stylelint.config.js
```typescript
module.exports = {
    extends: '@cloud-ru/ft-config-stylelint'
};
```

#### prettier.config.js
```typescript
module.exports = require('@cloud-ru/ft-all-linters-pack').defaultPrettierConfig;
```

#### lint-staged.config.js
```typescript
module.exports = require('@cloud-ru/ft-all-linters-pack').defaultLintStagedConfig;
```

## Oxfmt

Миграция с Prettier: `@cloud-ru/ft-all-linters-pack` **≥ 1.0.17**, из корня репозитория `pnpm exec migrate-to-oxfmt` (предпросмотр: `--dry-run`).

Подробно — конфиг, scripts, IDE, lint-staged и ESLint: **[README `@cloud-ru/ft-config-oxfmt`](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-oxfmt)**.
