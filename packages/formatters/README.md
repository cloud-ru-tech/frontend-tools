# `@cloud-ru/ft-formatters`

## Usage

```typescript
import {
  truncateString,
  formatBytes,
  toUint8Array,
  formatNumber,
  formatDate,
} from '@cloud-ru/ft-formatters';

formatBytes(764456); // output: 764.46 КБ

formatBytes(764456, formatBytes.languages.En); // output: 764.46 KB

truncateString('very long text will be truncated to 7 symbols and 3 dots', 10); // output: very lo...

toUint8Array('inputBase64Str'); // output: Uint8Array

formatDate('2023-01-20T11:15:00', formatDate.formatters.DateTime); // output: 20.01.2023 11:15:00

formatNumber(-10.55555, { softPrecision: 3 }); // output: -10.56

stringToBase64('string'); // output: c3RyaW5n

base64ToString('c3RyaW5n'); // output: string
```
