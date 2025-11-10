# `@cloud-ru/ft-config-i18n`

> Установка: `npm i @cloud-ru/ft-config-i18n`
>
> Вместе с пакетом приезжают все необходимые зависимости для работы `i18n` в вашем приложении.


## Configuration

```typescript
// i18n.ts 
import { i18nConfig } from '@cloud-ru/ft-config-i18n';
import { initReactI18next } from 'react-i18next';

const backendLoadPath; //for example: /localhost:2517/locales/{{lng}}/{{ns}}.json

i18nConfig({ initReactI18next, backendLoadPath });
```

#### Есть возможность передать в конфиг переменные для {{интерполяции}}
```typescript
// По-умолчанию добавлены
defaultVariables: {
  nbsp: '\u00A0',
  mdash: '\u2014',
}

// Пример добавления дополнительных правил
const interpolationVariables = {
  lt: '\u003C' // <
};

i18nConfig({ initReactI18next, backendLoadPath, interpolationVariables });

// Пример использования в файле с переводами
'Какой{{mdash}}то{{nbsp}}текст'
```

#### Есть возможность передать в конфиг внешние ресурсы переводов

```typescript
// Например из другого пакета
const I18N_NS = 'customNameSpaceFromAnotherPackage';

export const additionalTranslationsResources: AdditionalResources = {
  [Languages.Ru]: {
    [I18N_NS]: ruTranslation,
  },
  [Languages.En]: {
    [I18N_NS]: enTranslation,
  },
};

// Чтобы использовать переводы в стороннем пакете без провайдера
import i18next from 'i18next';

const { t } = useTranslation(I18N_NS, { i18n: i18next });

// Инициализация в целевом микрофронте

import { additionalTranslationsResources } from 'some-package';

i18nConfig({ initReactI18next, backendLoadPath, additionalResources: additionalTranslationsResources });
```

```typescript
//App.tsx
import 'src/i18n';
import { useTranslation } from 'react-i18next';

export function App(props) {
  const { i18n } = useTranslation();
  useLayoutEffect(() => {
    props.core?.lang.subscribe(lang => i18n.changeLanguage(lang));
  }, [props.core, i18n]);

  return (
     ...
  );
}
```

#### Вспомогательная функция для определения текущего выбранного языка

```typescript
import { i18nConfig } from '@cloud-ru/ft-config-i18n';

getCurrentLanguage();
```

## Typed Dictionary

> Ранее использовался пакет `@cloud-ru/ft-typed-language-dictionary`. 
> 
> Поскольку типизация объекта имеет отношение лишь к i18n подходу, функция теперь включена этом пакет.

Обход по файлу перевода позволит уйти от использования строковых констант в i18n.

IDE получает функции валидации корректности и автодополнения

ДО: `t('someObject.someProperty.fieldA')`

После: `t(Dictionary.someObject.someProperty.fieldA)`

## Usage

```typescript
import { typedDictionary } from '@cloud-ru/ft-config-i18n';
import translation from '../../../public/en-EN/translation.json';

export const Dictionary = typedDictionary(translation);
```
