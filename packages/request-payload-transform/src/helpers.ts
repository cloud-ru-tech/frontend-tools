import { ARRAY_REG, DELIMITER, MULTI_VALUE_CONDITIONS, PAGINATION_KEYS } from './constants';
import { FieldFilter, FieldSort, PaginationParams, RequestPayloadParams } from './types';

function isStringArray(str: string) {
  return ARRAY_REG.test(str);
}

function stringifySortParams(sortParams: FieldSort[]) {
  return sortParams.reduce((acc, cur, ind) => {
    const delimiter = ind !== 0 && ind !== sortParams.length ? DELIMITER : '';
    const { field, direction } = cur;

    return `${acc}${delimiter}${field}[${direction}]`;
  }, '');
}

function stringifyFilterParams(filters: FieldFilter[]) {
  return filters.reduce((acc, cur, ind) => {
    const delimiter = ind !== 0 && ind !== filters.length ? DELIMITER : '';
    const { field, condition, value } = cur;

    let formattedValue = value;

    if (MULTI_VALUE_CONDITIONS.includes(condition as (typeof MULTI_VALUE_CONDITIONS)[number]) && Array.isArray(value)) {
      formattedValue = `[${value.join(',')}]`;
    }

    return `${acc}${delimiter}${field}[${condition}]${formattedValue}`;
  }, '');
}

export function isValueNotEmpty(value: unknown) {
  if (typeof value === 'number') {
    return !isNaN(value);
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length !== 0;
  }

  return value !== undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function stringifyRequestParams(
  params: Partial<Omit<RequestPayloadParams, 'pagination'>> & { pagination?: Partial<PaginationParams> },
) {
  const { pagination, ...restParams } = params;
  const result: Partial<Record<keyof Omit<RequestPayloadParams, 'pagination'> | keyof PaginationParams, unknown>> = {
    ...pagination,
    ...restParams,
  };

  if (params.filter?.length) {
    result.filter = stringifyFilterParams(params.filter);
  }

  if (params.sort?.length) {
    result.sort = stringifySortParams(params.sort);
  }

  const returnString = Object.entries(result).reduce((acc, [key, value]) => {
    const delimiter = acc.length ? '&' : '';

    return `${acc}${delimiter}${key}=${value}`;
  }, '');

  return encodeURIComponent(returnString);
}

export function isPaginationKey(key: string): key is keyof PaginationParams {
  return Object.values(PAGINATION_KEYS).includes(key);
}

export function parseStringToValue(value: string) {
  if (isStringArray(value)) {
    try {
      return JSON.parse(value);
    } catch {
      return value
        .replace(/[[\]]/g, '')
        .split(',')
        .map(v => v.trim());
    }
  }

  const valueAsNumber = Number(value);

  return !isNaN(valueAsNumber) ? valueAsNumber : value;
}

export function removeEmptyValuesFromObject<T extends Partial<RequestPayloadParams | PaginationParams>>(obj: T) {
  return Object.keys(obj).reduce<T>((acc, cur) => {
    const key = cur as keyof T;

    let value = obj[key];

    if (isValueNotEmpty(value)) {
      if (isObject(value)) {
        value = removeEmptyValuesFromObject(value);
      }

      acc[key] = value;
    }

    return acc;
  }, {} as T);
}
