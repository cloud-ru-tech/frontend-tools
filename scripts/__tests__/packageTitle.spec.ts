import { expect, test } from 'vitest';

import { isValidPackageTitle } from '../utils/packageTitle';

test.each(['', 'A', 'abc123', 'Foo Bar', 'Foo ', 'Foo 2 Bar '])('accepts %j', input => {
  expect(isValidPackageTitle(input)).toBe(true);
});

test.each([' ', ' Foo', 'Foo  Bar', 'Foo  ', 'Foo\tBar', 'Foo\n', 'Foo-Bar', 'Тест'])('rejects %j', input => {
  expect(isValidPackageTitle(input)).toBe(false);
});
