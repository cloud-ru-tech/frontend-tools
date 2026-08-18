import pc from 'picocolors';

const themes = {
  info: pc.green,
  warn: pc.yellow,
  debug: pc.blue,
  error: pc.red,
} as const;

const log = (message: string, theme: keyof typeof themes = 'warn'): void => {
  console.log(themes[theme](`${message}`));
};

export const logError = (message: string) => log(message, 'error');
export const logInfo = (message: string) => log(message, 'info');
export const logDebug = (message: string) => log(message, 'debug');
export const logWarn = (message: string) => log(message, 'warn');
