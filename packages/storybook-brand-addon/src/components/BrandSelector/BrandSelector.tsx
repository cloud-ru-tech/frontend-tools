import '../../styles.css';

import { Button } from '@storybook/components';
import { AddIcon, CircleIcon } from '@storybook/icons';
import { useGlobals } from '@storybook/manager-api';
import { useMemo, useState } from 'react';

import { PARAM_CAN_ADD_CUSTOM_BRAND_KEY, PARAM_COLOR_MAP_KEY, PARAM_KEY } from '../../constants';
import { useCustomBrandContext } from '../../contexts';
import { DefaultBrandMapColors } from '../../types';
import { AddBrandPanel } from '../AddBrandPanel';
import { BrandOption, BrandOptionProps } from '../BrandOption';
import { Tooltip } from '../Tooltip';

type ToolbarItemProps = {
  defaultOpen?: boolean;
};

const mapBrandOptions = (colorsMap: DefaultBrandMapColors) => {
  if (!colorsMap) {
    return [];
  }

  return Object.keys(colorsMap).map((key: string) => ({ value: key, title: key, color: colorsMap[key] as string }));
};

export function BrandSelector({ defaultOpen = false }: ToolbarItemProps) {
  const [globals, updateGlobals] = useGlobals();
  const [open, setOpen] = useState(defaultOpen);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const canAddCustomBrand = globals[PARAM_CAN_ADD_CUSTOM_BRAND_KEY] ?? true;

  const { brands } = useCustomBrandContext();

  const brandOptions: BrandOptionProps[] = useMemo(
    () => [
      ...mapBrandOptions(globals[PARAM_COLOR_MAP_KEY]),
      ...(canAddCustomBrand
        ? brands.map(config => ({ value: config.key, color: config.color, title: config.title }))
        : []),
    ],
    [brands, canAddCustomBrand, globals],
  );

  const handleSelectOption = (value: string) => {
    updateGlobals({ [PARAM_KEY]: value });
    setOpen(false);
  };

  const handleAddBrand = () => setAddPanelOpen(false);

  const selectedBrand = useMemo(
    () => brandOptions.find(op => op.value === globals[PARAM_KEY]),
    [brandOptions, globals],
  );

  return (
    <Tooltip
      open={open}
      setOpen={setOpen}
      placement='bottom'
      tooltip={
        <div className={'brand-select-panel'}>
          {brandOptions.map(item => (
            <BrandOption
              key={item.value}
              {...item}
              selected={selectedBrand?.value === item.value}
              onSelect={handleSelectOption}
            />
          ))}

          {canAddCustomBrand && (
            <Tooltip
              open={addPanelOpen}
              setOpen={setAddPanelOpen}
              placement='right'
              tooltip={<AddBrandPanel onAdd={handleAddBrand} />}
            >
              <div className={'brand-select-option'}>
                Добавить бренд
                <AddIcon width={16} />
              </div>
            </Tooltip>
          )}
        </div>
      }
    >
      <Button
        active={open}
        title='Выберите брэнд'
        content={undefined}
        autoFocus={undefined}
        rel={undefined}
        rev={undefined}
      >
        <CircleIcon color={selectedBrand?.color} />
        {selectedBrand?.title || 'Выберите брэнд'}
      </Button>
    </Tooltip>
  );
}
