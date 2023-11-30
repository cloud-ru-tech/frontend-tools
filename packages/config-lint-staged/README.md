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
