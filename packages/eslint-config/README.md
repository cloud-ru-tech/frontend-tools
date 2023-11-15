# `@cloud-ru/eslint-config`

> Установка: `npm i @cloud-ru/eslint-config`
>
> Вместе с пакетом приезжают все необходимые зависимости для работы `eslint` в вашем приложении.

## Usage
For monorepositories:
```ts
// projectRoot/.eslintrc.js
module.exports = {
  extends: '@cloud-ru/eslint-config/monorepo',
  //some additional rules if needed
}
```

For other projects:
```ts
// projectRoot/.eslintrc.js
module.exports = {
  extends: '@cloud-ru/eslint-config/base',
  //some additional rules if needed
}
```

## Tips
### Usage deprecation annotation

```ts
  /**
  * @deprecated Any message
  * */
  const deprecatedConstant = 'deprecatedConstant';

  // Eslint: 'deprecatedConstant' is deprecated. Any message ('deprecation/deprecation')
  deprecatedConstant
```

