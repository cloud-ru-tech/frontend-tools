# `@cloud-ru/ft-config-lint-staged`

> Установка: `npm i @cloud-ru/ft-config-lint-staged`
>
> Вместе с пакетом приезжают все необходимые зависимости для работы `lint-staged` в вашем приложении.
> 
> Для успешной работы требуются `eslint`, `stylelint` и `prettier`. Возможно вам подойдут следующие пакеты:
> * [`@cloud-ru/eslint-config`](../../packages/eslint-config)
> * [`@cloud-ru/ft-config-stylelint`](../../packages/config-stylelint)
> * [`@cloud-ru/ft-config-prettier`](../../packages/config-prettier)
## Usage

```
// projectRoot/lint-staged.config.js
module.exports = require('@cloud-ru/ft-config-lint-staged').defaultLintStagedConfig;
```

### Oxfmt вместо Prettier

```
module.exports = require('@cloud-ru/ft-config-lint-staged').defaultLintStagedConfigWithOxfmt;
```

### Oxlint вместо ESLint

```
// Prettier
module.exports = require('@cloud-ru/ft-config-lint-staged').defaultLintStagedConfigWithOxlint;
// Oxfmt
module.exports = require('@cloud-ru/ft-config-lint-staged').defaultLintStagedConfigWithOxlintAndOxfmt;
```

`*.{ts,js,tsx,jsx}` → `oxlint --fix` и `prettier --write` / `oxfmt --write`; `*.scss` → `stylelint --fix`.
Конфиг Oxlint — [`@cloud-ru/ft-config-oxlint`](../../packages/config-oxlint).
