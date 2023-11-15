export const splitArray = <T>(array: T[], condition: (value: T, index: number, array: T[]) => boolean) => {
  const first: T[] = [];
  const second: T[] = [];

  array.forEach((item, index) => {
    if (condition(item, index, array)) {
      first.push(item);
    } else {
      second.push(item);
    }
  });

  return [first, second];
};
