import { addons, types } from '@storybook/manager-api';

import { BrandSelector } from './components';
import { ADDON_ID, TOOL_ID } from './constants';
import { CustomBrandsContextProvider } from './contexts';

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    id: 'brand',
    title: 'Brand',
    type: types.TOOL,
    render: ({ active }) => (
      <CustomBrandsContextProvider>
        <BrandSelector defaultOpen={active} />
      </CustomBrandsContextProvider>
    ),
  });
});
