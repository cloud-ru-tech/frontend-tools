import { Globals } from 'storybook/internal/types';
import { useDarkMode } from '@storybook-community/storybook-dark-mode';

import { PARAM_COLOR_MAP_KEY } from '../constants';
import { getCustomBrands } from '../customBrands';

export const getDefaultBrands = (globals: Globals) => {
  if (!globals || !globals[PARAM_COLOR_MAP_KEY]) {
    return {};
  }

  return Object.fromEntries(Object.keys(globals[PARAM_COLOR_MAP_KEY]).map(brand => [brand, globals[brand]]));
};

export function useStorybookBrand({ brand, globals }: { brand: string; globals: Globals }) {
  const isDark = useDarkMode();

  const brandMap = {
    ...getDefaultBrands(globals),
    ...Object.fromEntries(getCustomBrands().map(brand => [brand.key, brand.config])),
  };

  return brandMap[brand]?.[isDark ? 'dark' : 'light'];
}
