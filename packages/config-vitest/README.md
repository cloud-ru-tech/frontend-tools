# `@cloud-ru/ft-config-vitest`

> Установка: `npm i @cloud-ru/ft-config-vitest`
>
> Вместе с пакетом приезжают все необходимые зависимости для работы `vitest` в вашем приложении.

## Usage

Добавить в корень проекта файл _vitest.config.ts_ со следующим содержанием:

```ts
import createConfig from '@cloud-ru/ft-config-vitest';
export default createConfig();
// or export default createConfig(overrideDefaults);
```

Добавить:
- в раздел _scripts_ в _package.json_ добавить команду ```"test:unit": "vitest run"``` .
- в _tsconfig.json_ в _include_ добавить путь к _vitest.config.ts_ ```"include": ["./vitest.config.ts"]```
- в _tsconfig.json_ в _compilerOptions.types_ добавить типы ```"types": ["vitest/globals"]```

Регулярное выражение по которому запускаются тесты ```**/__tests__/**/*.spec.(ts|js)x?```.
