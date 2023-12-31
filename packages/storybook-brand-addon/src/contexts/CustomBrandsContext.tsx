import { useGlobals } from '@storybook/manager-api';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

import { DEFAULT_BRAND } from '../constants';
import { addBrand, deleteBrand, getCustomBrands, updateBrand } from '../customBrands';
import { BrandInfo, CustomBrandConfig } from '../types';

type CustomBrandsContextProps = {
  brands: CustomBrandConfig[];
  brandList: string[];
  addBrand(key: string, config: BrandInfo): void;
  updateBrand(key: string, config: Partial<BrandInfo>): void;
  deleteBrand(key: string): void;
};

const CustomBrandsContext = createContext<CustomBrandsContextProps>({
  brands: [],
  brandList: [],
  addBrand() {},
  updateBrand() {},
  deleteBrand() {},
});

type CustomBrandContextProviderProps = {
  children: ReactNode;
};

export function useCustomBrandContext() {
  return useContext(CustomBrandsContext);
}

export function CustomBrandsContextProvider({ children }: CustomBrandContextProviderProps) {
  const [brands, setBrands] = useState(getCustomBrands);
  const [globals, updateGlobals] = useGlobals();

  const handleAddBrand: CustomBrandsContextProps['addBrand'] = useCallback((key, config) => {
    addBrand(key, config);
    setBrands(getCustomBrands());
  }, []);

  const handleUpdateBrand: CustomBrandsContextProps['updateBrand'] = useCallback((key, config) => {
    updateBrand(key, config);
    setBrands(getCustomBrands());
  }, []);

  const handleDeleteBrand = useCallback(
    (key: string) => {
      deleteBrand(key);
      setBrands(getCustomBrands());

      if (key === globals.brand) {
        updateGlobals({ brand: DEFAULT_BRAND });
      }
    },
    [globals.brand, updateGlobals],
  );

  return (
    <CustomBrandsContext.Provider
      value={{
        brands,
        brandList: brands.map(item => item.key),
        addBrand: handleAddBrand,
        updateBrand: handleUpdateBrand,
        deleteBrand: handleDeleteBrand,
      }}
    >
      {children}
    </CustomBrandsContext.Provider>
  );
}
