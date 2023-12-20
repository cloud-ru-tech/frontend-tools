# `@cloud-ru/ft-lerna-changelog-generator`

> Установка: `npm i @cloud-ru/ft-lerna-changelog-generator`

## Usage

```
npx lerna-changelog-generator --projectUrl 'https://github.com/repo' --defaultBranch 'main'
```

- `projectUrl` - ссылка на проект. Требуется для построения ссылок на файлы. При отсутсвии этого параметра будет использоваться переменная окружения `CI_PROJECT_URL`.
- `defaultBranch` - название основной ветки. Требуется для построения ссылок на файлы. При отсутсвии этого параметра будет использоваться переменная окружения `CI_DEFAULT_BRANCH`.

## Requirements

В окружении, в котором запускается скрипт, должен быть git.
