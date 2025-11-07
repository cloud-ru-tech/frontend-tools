import { truncateString } from '../src';

describe('@sbercloud/ft-formatters/truncateString', () => {
  it('length is equal to maxLength', () => {
    const input = 'abcdefgh';
    expect(truncateString(input, input.length)).toEqual(input);
  });
  it('length is equal to maxLength - 1', () => {
    const input = 'abcdefgh';
    expect(truncateString(input, input.length - 1)).toBe('abcd...');
  });
});
