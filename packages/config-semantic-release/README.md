# `@cloud-ru/ft-config-semantic-release`

> Установка: `npm i @cloud-ru/ft-config-semantic-release`
>
> Вместе с пакетом приезжают все необходимые зависимости для работы `semantic-release` в вашем приложении.

## Usage

```js
// projectRoot/release.config.js
module.exports = require('@cloud-ru/ft-config-semantic-release').defaultReleaseConfig();

// если необходимо, чтобы при релизе создавался npm-пакет
module.exports = require('@cloud-ru/ft-config-semantic-release').defaultReleaseConfig({ shouldPublishPackage: true });
```
Также необходимо добавить соответствующую job в ваш CI/CD pipeline.

### BREAKING CHANGE commit example
#### Для выпуска мажорной версии нужно использовать `BREAKING CHANGE:` в футере коммита
```
feat(*TaskId*): some feature

BREAKING CHANGE: something that is not compatible with prev version
```
