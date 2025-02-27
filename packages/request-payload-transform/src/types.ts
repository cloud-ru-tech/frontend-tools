import {
  FILTER_CONDITION,
  MULTI_VALUE_CONDITIONS,
  PARAM_KEYS,
  SINGLE_VALUE_CONDITIONS,
  SORT_DIRECTION,
} from './constants';
import { RequireAtLeastOne } from './utilsTypes';

export type SortDirection = (typeof SORT_DIRECTION)[number];

export type FieldSort = {
  field: string;
  direction: SortDirection;
};

export type FilterCondition = (typeof FILTER_CONDITION)[number];

type BaseFilter = {
  field: string;
  condition: FilterCondition;
  value: unknown;
};

type MultiValueFilter = {
  condition: (typeof MULTI_VALUE_CONDITIONS)[number];
  value: unknown[];
};

type SingleValueFilter = {
  condition: (typeof SINGLE_VALUE_CONDITIONS)[number];
  value: string | number | boolean | null;
};

export type FieldFilter = BaseFilter & (MultiValueFilter | SingleValueFilter);

export type PaginationParams = RequireAtLeastOne<{
  limit?: number;
  offset?: number;
}>;

export type RequestPayloadParams = RequireAtLeastOne<{
  [PARAM_KEYS.sort]?: FieldSort[];
  [PARAM_KEYS.filter]?: FieldFilter[];
  [PARAM_KEYS.pagination]?: PaginationParams;
  [PARAM_KEYS.search]?: string | number | boolean;
}>;
