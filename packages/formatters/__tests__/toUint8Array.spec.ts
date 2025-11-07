import { toUint8Array } from '../src';

describe('@cloud-ru/ft-formatters/toUint8Array', () => {
  it('decode string Base64 to Uint8Array', () => {
    const inputStr = 'inputStr';

    expect([...toUint8Array(inputStr).values()]).toEqual([138, 122, 110, 181, 43, 107]);
  });

  it('decode empty string Base64 to Uint8Array', () => {
    const inputStr = '';

    expect([...toUint8Array(inputStr).values()]).toEqual([]);
  });
});
