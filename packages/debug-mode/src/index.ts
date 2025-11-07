export const DEBUG_MODE_LOCALSTORAGE_KEY = 'debug_mode_enabled';
export const META_MODE_LOCALSTORAGE_KEY = 'meta_mode_enabled';
export const HYBRID_MODE_LOCALSTORAGE_KEY = 'hybrid_mode_enabled';

export function isDebugModeEnabled() {
  return Object.prototype.hasOwnProperty.call(localStorage, DEBUG_MODE_LOCALSTORAGE_KEY);
}

export function toggleDebugMode() {
  const isActive = isDebugModeEnabled();
  isActive
    ? localStorage.removeItem(DEBUG_MODE_LOCALSTORAGE_KEY)
    : localStorage.setItem(DEBUG_MODE_LOCALSTORAGE_KEY, 'true');
}

export function isMetaModeEnabled() {
  return Object.prototype.hasOwnProperty.call(localStorage, META_MODE_LOCALSTORAGE_KEY);
}

export function toggleMetaMode() {
  const isActive = isMetaModeEnabled();
  isActive
    ? localStorage.removeItem(META_MODE_LOCALSTORAGE_KEY)
    : localStorage.setItem(META_MODE_LOCALSTORAGE_KEY, 'true');
}

export function isHybridModeEnabled() {
  return Object.prototype.hasOwnProperty.call(localStorage, HYBRID_MODE_LOCALSTORAGE_KEY);
}

export function toggleHybridMode() {
  const isActive = isHybridModeEnabled();
  isActive
    ? localStorage.removeItem(HYBRID_MODE_LOCALSTORAGE_KEY)
    : localStorage.setItem(HYBRID_MODE_LOCALSTORAGE_KEY, 'true');
}

function addMessagePrefix(scope: string, message: string) {
  const scopePrefix = scope ? `(${scope})` : '';

  return `DEV_ALERT${scopePrefix}: ${message}`;
}

export function configureDevAlerts({ scope, enabled }: { scope: string; enabled?: boolean }) {
  return {
    error(message: string, localCondition = true): void {
      if (enabled && localCondition && isDebugModeEnabled()) {
        console.error(addMessagePrefix(scope, message));
      }
    },
    warning(message: string, localCondition = true): void {
      if (enabled && localCondition && isDebugModeEnabled()) {
        console.warn(addMessagePrefix(scope, message));
      }
    },
    info(message: string, localCondition = true): void {
      if (enabled && localCondition && isDebugModeEnabled()) {
        console.info(addMessagePrefix(scope, message));
      }
    },
  };
}
