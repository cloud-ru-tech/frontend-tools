export const DELIMITER = ';';
export const ARRAY_REG = /^\[.+]$/;

export const EXTRACT_VALUES_REG = /(\w+)\[([^\]]+)]([^;]+)?/g;

export const PARAM_KEYS = {
  filter: 'filter',
  sort: 'sort',
  pagination: 'pagination',
  search: 'search',
} as const;

export const PAGINATION_KEYS = {
  offset: 'offset',
  limit: 'limit',
};

export const SORT_DIRECTION = ['a', 'd'] as const;

export const SINGLE_VALUE_CONDITIONS = ['eq', 'nq', 'lt', 'le', 'gt', 'ge', 'cn', 'nc', 'sw'] as const;

export const MULTI_VALUE_CONDITIONS = ['in', 'ni'] as const;

export const FILTER_CONDITION = [...SINGLE_VALUE_CONDITIONS, ...MULTI_VALUE_CONDITIONS];
