import { StorageKeys } from '../../types';
import { BRAND_STORAGE_KEYS } from '../constants';

export const getStorageKeys = (brandKey: string): StorageKeys =>
  Object.fromEntries(
    Object.entries(BRAND_STORAGE_KEYS).map(([key, value]) => [key, value + '_' + brandKey]),
  ) as StorageKeys;
