# `@cloud-ru/eslint-config`

> Установка: `npm i @cloud-ru/eslint-config`
>
> Вместе с пакетом приезжают все необходимые зависимости для работы `eslint` в вашем приложении.

## Usage
For monorepositories:
```ts
// projectRoot/eslint.config.mjs
import monorepoEslintConfig from '@cloud-ru/eslint-config/monorepo';

// simple usage
export default monorepoEslintConfig;

// extended usage with rules
export default [
  ...monorepoEslintConfig,
  {
    files: ['packages/config-playwright/src/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];

```

For other projects:
```ts
// projectRoot/eslint.config.mjs
import baseConfig from '@cloud-ru/eslint-config';

export default baseConfig;
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

