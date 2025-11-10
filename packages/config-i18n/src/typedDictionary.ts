type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};

function valueIsComplex(value: string | TranslationDictionary): value is TranslationDictionary {
  return typeof value !== 'string';
}

export function typedDictionary<T extends TranslationDictionary>(
  obj: T,
  res: TranslationDictionary = {},
  prefix = '',
): T {
  Object.keys(obj).forEach(x => {
    const value = obj[x];
    if (valueIsComplex(value)) {
      res[x] = {};
      typedDictionary(value, <TranslationDictionary>res[x], prefix ? `${prefix}.${x}` : x);
    } else {
      res[x] = prefix ? `${prefix}.${x}` : x;
    }
  });
  return res as T;
}
