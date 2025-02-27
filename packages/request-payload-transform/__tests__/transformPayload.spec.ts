import { expect } from 'vitest';

import { createRequestPayload, parseQueryParamsString, RequestPayloadParams } from '../src';

const REQUEST_PARAMS: Required<RequestPayloadParams> = {
  filter: [
    { field: 'name', condition: 'eq', value: 'John' },
    { field: 'age', condition: 'in', value: [18, 25] },
    { field: 'bool', condition: 'in', value: [true, false] },
    { field: 'great', condition: 'ge', value: 13 },
    { field: 'stringsArray', condition: 'in', value: ['first', 'second'] },
    { field: 'singleArrayString', condition: 'in', value: ['first'] },
  ],
  sort: [
    { field: 'age', direction: 'd' },
    { field: 'name', direction: 'a' },
  ],
  search: 'searching',
  pagination: { limit: 10, offset: 2 },
};

const PARAMS_RESULT_STRING = encodeURIComponent(
  'limit=10&offset=2&filter=name[eq]John;age[in][18,25];bool[in][true,false];great[ge]13;stringsArray[in][first,second];singleArrayString[in][first]&sort=age[d];name[a]&search=searching',
);

describe('@cloud-ru/ft-request-payload-transform', () => {
  it('createRequestPayload with initial arguments', async () => {
    const payload = createRequestPayload(REQUEST_PARAMS);
    const paramsAsString = payload.toString();
    const paramsAsObject = payload.toObject();

    expect(paramsAsString).toEqual(PARAMS_RESULT_STRING);
    expect(paramsAsObject).toEqual(REQUEST_PARAMS);
  });

  it('createRequestPayload pass search param and empty arrays for filter and sort', async () => {
    const payload = createRequestPayload({ filter: [], sort: [], search: REQUEST_PARAMS.search });

    const paramsAsString = payload.toString();
    const paramsAsObject = payload.toObject();

    expect(paramsAsString).toEqual(encodeURIComponent(`search=${REQUEST_PARAMS.search}`));
    expect(paramsAsObject).toEqual({ search: REQUEST_PARAMS.search });
  });

  it('createRequestPayload pass only empty arrays for filter and sort', async () => {
    const payload = createRequestPayload({ filter: [], sort: [] });

    const paramsAsString = payload.toString();
    const paramsAsObject = payload.toObject();

    expect(paramsAsString).toBe('');
    expect(paramsAsObject).toEqual({});
  });

  it('parseQueryParamsString empty string', async () => {
    const params = parseQueryParamsString('');

    expect(params).toBeUndefined();
  });

  it('parseQueryParamsString broken string returns only valid values', async () => {
    const params = parseQueryParamsString(
      encodeURIComponent(
        'limit=&offset=2&filter=name[eq];age[in][18,25];bool;stringsArray[in][first,second];singleArrayString[in]&sort=&search',
      ),
    );

    expect(params).toEqual({
      pagination: { offset: 2 },
      filter: [
        { field: 'age', condition: 'in', value: [18, 25] },
        {
          field: 'stringsArray',
          condition: 'in',
          value: ['first', 'second'],
        },
      ],
    });
  });

  it('parseRequestParams return proper params object', async () => {
    const payload = parseQueryParamsString(PARAMS_RESULT_STRING);

    expect(payload).toEqual(REQUEST_PARAMS);
  });
});
