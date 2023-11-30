# `@cloud-ru/ft-storybook-brand-addon`

Пакет для переключения между темами брендов

## Usage

```
npm i @cloud-ru/ft-storybook-brand-addon


// .storybook/main.js в массив addons добавить запись
addons: [
    '@cloud-ru/ft-storybook-brand-addon',
    ...другие аддоны
]

// preview.ts в массив decorators добавить запись
decorators: [
    'withBrand',
    ...другие декораторы
]
```

В preview.ts задать дефолтные значения глобальных переменных: 
- PARAM_KEY (название брэнда - напр. использовать константу DEFAULT_BRAND), 
- PARAM_COLOR_MAP_KEY (список доступных брэндов с цветаом-подсказкой)
- DEFAULT_BRAND (названия классов для светлой и темной темы)
- другие брэнды в том же формате что и DEFAULT_BRAND

```
// preview.ts
import {PARAM_KEY, PARAM_COLOR_MAP_KEY, DEFAULT_BRAND} from '@cloud-ru/ft-storybook-brand-addon';
import DefaultBrandThemes from '@cloud-ru/figma-tokens/build/css/brand.module.css';
import BrandTheme1 from 'some-theme-package1/theme.css';
import BrandTheme2 from 'some-theme-package2/theme.css';

enum Brand {
  Default = 'Default', // либо = [DEFAULT_BRAND]
  Brand1 = 'Brand1',
  Brand2 = 'Brand2',
}

const defaultBrandMap = {
  [Brand.Default]: DefaultBrandThemes,
  [Brand.Brand1]: BrandTheme1,
  [Brand.Brand2]: BrandTheme2,
}

const globalTypes = {
  [PARAM_KEY]: {
    name: 'Brand',
    description: 'Changing brands',
    defaultValue: DEFAULT_BRAND,
  },
  [PARAM_COLOR_MAP_KEY]: {
    name: 'Brand Map with Colors',
    description: 'Map of color for brands list',
    defaultValue: {
      [Brand.Default]: '#95cdf3',
      [Brand.Brand1]: '#69ce86',
      [Brand.Brand2]: '#a69dfa',
    },
  },
  [DEFAULT_BRAND]: {
    name: 'Brand Default',
    description: '',
    defaultValue: { ...defaultBrandMap[Brand.Default] },
  },
  [Brand.Brand1]: {
    name: 'Brand 1',
    description: '',
    defaultValue: { ...defaultBrandMap[Brand.Brand1] },
  },
  [Brand.Brand2]: {
    name: 'Brand 2',
    description: '',
    defaultValue: { ...defaultBrandMap[Brand.Brand2] },
  },
};

```
