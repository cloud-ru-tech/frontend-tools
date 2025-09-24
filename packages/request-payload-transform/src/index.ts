import { EXTRACT_VALUES_REG, PARAM_KEYS } from './constants';
export * from './types';
import {
  isPaginationKey,
  isValueNotEmpty,
  parseStringToValue,
  removeEmptyValuesFromObject,
  stringifyRequestParams,
} from './helpers';
import {
  FieldFilter,
  FieldSort,
  FilterCondition,
  PaginationParams,
  RequestPayloadParams,
  SortDirection,
} from './types';

type RequestPayloadFormatMethods = {
  toObject(): Partial<RequestPayloadParams>;
  toString(params?: { encode?: boolean }): string;
};

type RequestPayloadCreator = RequestPayloadFormatMethods & {
  filter(params: FieldFilter): RequestPayloadCreator;
  sort(params: FieldSort): RequestPayloadCreator;
  pagination(params: PaginationParams): RequestPayloadCreator;
  search(value: RequestPayloadParams['search']): RequestPayloadCreator;
};

export function createRequestPayload(params?: undefined): RequestPayloadCreator;
export function createRequestPayload(params: RequestPayloadParams): RequestPayloadFormatMethods;
export function createRequestPayload(
  params?: RequestPayloadParams,
): RequestPayloadFormatMethods | RequestPayloadCreator {
  const result: Partial<RequestPayloadParams> = params || {};

  function toObject() {
    return removeEmptyValuesFromObject(result);
  }

  function toString({ encode }: { encode?: boolean } = { encode: true }) {
    return stringifyRequestParams(toObject(), { encode });
  }

  if (params !== undefined) {
    return {
      toObject,
      toString,
    } as RequestPayloadFormatMethods;
  }

  return {
    filter(params) {
      if (!result.filter) {
        result.filter = [];
      }

      result.filter.push(params);
      return this;
    },
    sort(params) {
      if (!result.sort) {
        result.sort = [];
      }

      result.sort.push(params);
      return this;
    },
    pagination(params) {
      result.pagination = params;
      return this;
    },
    search(value) {
      result.search = value;
      return this;
    },
    toObject,
    toString,
  } as RequestPayloadCreator;
}

export function parseQueryParamsString(params: string): Partial<RequestPayloadParams> | undefined {
  if (!params.length) return undefined;

  const paramsArray = decodeURIComponent(params).split('&');

  const result = paramsArray.reduce<
    Partial<Omit<RequestPayloadParams, 'pagination'>> & { pagination?: Partial<PaginationParams> }
  >((acc, cur) => {
    const [param, value] = cur.split('=');

    if (isValueNotEmpty(value)) {
      const matches = Array.from(value.matchAll(EXTRACT_VALUES_REG), ([, f, c, v]) => [f, c, v]);

      if (param === PARAM_KEYS.sort) {
        if (matches.length) {
          acc[param] = matches.map(([field, direction]) => ({
            field,
            direction: direction as SortDirection,
          }));
        }

        return acc;
      }

      if (param === PARAM_KEYS.filter) {
        if (matches.length) {
          acc[param] = matches
            .map(
              ([field, condition, value]) =>
                ({
                  field,
                  condition: condition as FilterCondition,
                  value: parseStringToValue(value),
                }) as FieldFilter,
            )
            .filter(({ value }) => value !== undefined);
        }

        return acc;
      }

      if (isPaginationKey(param)) {
        if (!acc.pagination) {
          acc.pagination = {};
        }

        acc.pagination[param] = parseStringToValue(value);

        return acc;
      }

      acc[param as keyof RequestPayloadParams] = parseStringToValue(value);
    }

    return acc;
  }, {});

  return result as RequestPayloadParams;
}
