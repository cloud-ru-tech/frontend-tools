# `@cloud-ru/ft-config-tsconfig`

> Установка: `npm i @cloud-ru/ft-config-tsconfig`
>
> Вместе с пакетом приезжают все необходимые зависимости для работы `tsconfig` в вашем приложении.

## Usage

```
// projectRoot/tsconfig.json
{
  "extends": "@cloud-ru/ft-config-tsconfig",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
        ...
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```
