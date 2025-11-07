# `@cloud-ru/ft-debug-mode`

## Usage

```typescript
import { isDebugModeEnabled, enableDebugMode, disableDebugMode, configureDevAlerts } from '@cloud-ru/ft-debug-mode';

const { error, warning } = configureDevAlerts('someScope');

const condition = somethingThatIsBoolean; // boolean condition

/* the message in console will be shown only if condition === true */
error(condition, 'message'); // DEV_ALERT(someScope): message

warning(condition, 'message'); // DEV_ALERT(someScope): message
```
