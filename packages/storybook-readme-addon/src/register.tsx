import { AddonPanel } from '@storybook/components';
import { addons, types } from '@storybook/manager-api';
import type { Key } from 'react';

import { ReadmePanel } from './ReadmePanel';

const ADDON_ID = '@cloud-ru/ft-storybook-readme-addon';
const PANEL_ID = `${ADDON_ID}/panel`;

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Readme',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    render: ({ active = false, key }: { active?: boolean; key: Key }) => (
      <AddonPanel active={active} key={key}>
        <ReadmePanel />
      </AddonPanel>
    ),
  });
});
