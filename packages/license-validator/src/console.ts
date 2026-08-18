import pc from 'picocolors';

const themes = {
  info: pc.green,
  data: pc.white,
  warn: pc.yellow,
  error: pc.red,
} as const;

const log = (message: string, theme: keyof typeof themes = 'warn'): void => {
  // eslint-disable-next-line no-console
  console.log(themes[theme](`${message}\n`));
};

export const logError = (message: string) => log(message, 'error');
export const logInfo = (message: string) => log(message, 'info');
export const logData = (message: string) => log(message, 'data');
export const logWarn = (message: string) => log(message, 'warn');
