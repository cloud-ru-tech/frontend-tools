# `@cloud-ru/ft-all-linters-pack`

> Содержит в себе следующие утилиты для разработки:
> * [@cloud-ru/ft-config-husky](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-husky)
> * [@cloud-ru/ft-config-lint-staged](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-lint-staged)
> * [@cloud-ru/eslint-config](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/eslint-config)
> * [@cloud-ru/ft-config-prettier](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-prettier)
> * [@cloud-ru/ft-config-stylelint](https://github.com/cloud-ru-tech/frontend-tools/tree/master/packages/config-stylelint)

## Usage

#### .eslintrc.js
```typescript
module.exports = {
  extends: '@cloud-ru/eslint-config/single-spa'
  // Будет установлен транзитивно вместе с данным пакетом
};
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
