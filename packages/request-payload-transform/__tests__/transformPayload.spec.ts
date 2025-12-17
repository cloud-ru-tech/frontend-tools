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
    { field: 'date', condition: 'eq', value: new Date('2025-08-26').toISOString() },
    { field: 'object', condition: 'eq', value: { hours: 1, minutes: 2, seconds: 3 } },
  ],
  ordering: [
    { field: 'age', direction: '-' },
    { field: 'name', direction: '+' },
  ],
  search: 'searching',
  pagination: { limit: 10, offset: 2 },
};

const CLEAN_PARAMS_RESULT_STRING =
  'limit=10&offset=2&filter=name[eq]John;age[in][18,25];bool[in][true,false];great[ge]13;stringsArray[in][first,second];singleArrayString[in][first];date[eq]2025-08-26T00:00:00.000Z;object[eq]hours:1,minutes:2,seconds:3&ordering=[-age,+name]&search=searching';

const ENCODED_PARAMS_RESULT_STRING = encodeURIComponent(CLEAN_PARAMS_RESULT_STRING);

describe('@cloud-ru/ft-request-payload-transform', () => {
  it('createRequestPayload with initial arguments', async () => {
    const payload = createRequestPayload(REQUEST_PARAMS);
    const paramsAsString = payload.toString({ encode: true });
    const paramsAsObject = payload.toObject();

    expect(paramsAsString).toEqual(ENCODED_PARAMS_RESULT_STRING);
    expect(paramsAsObject).toEqual(REQUEST_PARAMS);
  });

  it('createRequestPayload pass search param and empty arrays for filter and ordering', async () => {
    const payload = createRequestPayload({ filter: [], ordering: [], search: REQUEST_PARAMS.search });

    const paramsAsString = payload.toString({ encode: false });
    const paramsAsObject = payload.toObject();

    expect(paramsAsString).toEqual(`search=${REQUEST_PARAMS.search}`);
    expect(paramsAsObject).toEqual({ search: REQUEST_PARAMS.search });
  });

  it('createRequestPayload pass only empty arrays for filter and ordering', async () => {
    const payload = createRequestPayload({ filter: [], ordering: [] });

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
        'limit=&offset=2&filter=name[eq];age[in][18,25];bool;stringsArray[in][first,second];singleArrayString[in]&ordering=&search',
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
    const payload = parseQueryParamsString(CLEAN_PARAMS_RESULT_STRING);

    console.info('PAYLOAD__', {
      payload,
      requestParams: REQUEST_PARAMS.ordering,
    });

    expect(payload).toEqual(REQUEST_PARAMS);
  });

  it('createRequestPayload pass empty arrays for filter', async () => {
    const payload = createRequestPayload({
      filter: [
        { field: 'emails', condition: 'in', value: [] },
        { field: 'name', condition: 'eq', value: '' },
        { field: 'surname', condition: 'eq', value: null },
        { field: 'meta', condition: 'eq', value: {} },
      ],
    });

    const paramsAsString = payload.toString();
    const paramsAsObject = payload.toObject();

    expect(paramsAsString).toBe('');
    expect(paramsAsObject).toEqual({});
  });
});
