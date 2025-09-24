import { ARRAY_REG, DELIMITER, MULTI_VALUE_CONDITIONS, PAGINATION_KEYS } from './constants';
import { FieldFilter, FieldSort, PaginationParams, RequestPayloadParams } from './types';

const OBJECT_FORMAT_REGEX = /^[a-zA-Z\d]+:(,|[a-zA-Z\d]+).*/;

function isStringArray(str: string) {
  return ARRAY_REG.test(str);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseStringToTypedValue(value: string) {
  const valueAsNumber = Number(value);
  const valueAsBooleanOrString = ['true', 'false'].includes(value) ? value === 'true' : value;

  return isNaN(valueAsNumber) ? valueAsBooleanOrString : valueAsNumber;
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

    if (isObject(value)) {
      formattedValue = Object.entries(value).reduce(
        (acc, [key, value], ind, arr) => `${acc}${key}:${value}${ind === arr.length - 1 ? '' : ','}`,
        '',
      );
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

export function stringifyRequestParams(
  params: Partial<Omit<RequestPayloadParams, 'pagination'>> & { pagination?: Partial<PaginationParams> },
  { encode = false }: { encode?: boolean },
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

  return encode ? encodeURIComponent(returnString) : returnString;
}

export function isPaginationKey(key: string): key is keyof PaginationParams {
  return Object.values(PAGINATION_KEYS).includes(key);
}

export function parseStringToValue(filterValue: string) {
  if (filterValue === undefined) {
    return undefined;
  }

  if (isStringArray(filterValue)) {
    try {
      return JSON.parse(filterValue);
    } catch {
      return filterValue
        .replace(/[[\]]/g, '')
        .split(',')
        .map(v => v.trim());
    }
  }

  // Check if value represents an object in format "key1:value1,key2:value2,..."
  const isObjectString = OBJECT_FORMAT_REGEX.test(filterValue);
  if (isObjectString) {
    const parsedValue = filterValue.split(',').reduce<Record<string, string | number | boolean>>((acc, cur) => {
      const [key, value] = cur.split(':');

      if (key !== undefined && value !== undefined) {
        acc[key] = parseStringToTypedValue(value);
      }

      return acc;
    }, {});

    return Object.values(parsedValue).length ? parsedValue : undefined;
  }

  return parseStringToTypedValue(filterValue);
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
