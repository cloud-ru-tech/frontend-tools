import { formatPhoneNumber } from '../src';

describe('@cloud-ru/ft-formatters/formatPhoneNumber', () => {
  it('should return undefined', () => {
    expect(formatPhoneNumber()).toBeUndefined();
  });

  it('should return number as is', () => {
    const input = '+7(123)1231212';
    expect(formatPhoneNumber(input)).toBe(input);
  });

  it('should return formatted number', () => {
    const input = '+71231231212';
    expect(formatPhoneNumber(input)).toBe('+7 123 123-12-12');
  });
});
