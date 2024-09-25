import { JSX, useRef } from 'react';
import { Addon_StoryContext, StoryFn } from 'storybook/internal/types';

import { DEFAULT_BRAND, PARAM_COLOR_MAP_KEY, PARAM_KEY } from './constants';
import { getCustomBrandList, getCustomBrands } from './customBrands';
import { useStorybookBrand } from './hooks';

export function BrandProvider(StoryFn: StoryFn, { globals }: Addon_StoryContext): JSX.Element {
  const brand =
    getCustomBrandList().includes(globals[PARAM_KEY]) ||
    Object.keys(globals[PARAM_COLOR_MAP_KEY] || {}).includes(globals[PARAM_KEY])
      ? globals[PARAM_KEY]
      : DEFAULT_BRAND;

  const brandClassName = useStorybookBrand({ brand, globals });
  const brandClassnameRef = useRef<string>();

  // need to do it this way to update theme before any other child component render & useEffect/useLayoutEffect
  if (brandClassnameRef.current !== brandClassName) {
    brandClassnameRef.current && document.body.classList.remove(brandClassnameRef.current);
    document.body.classList.add(brandClassName);
    brandClassnameRef.current = brandClassName;
  }

  return (
    <>
      {getCustomBrands().map(config => (
        <style key={config.key}>{config.content}</style>
      ))}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      {StoryFn()}
    </>
  );
}
