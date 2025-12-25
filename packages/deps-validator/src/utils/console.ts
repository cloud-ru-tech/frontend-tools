import colors from 'colors/safe';

const themes = {
  info: 'green',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
} as const;

colors.setTheme(themes);

const log = (message: string, theme: keyof typeof themes = 'warn'): void => {
  console.log(colors[themes[theme]](`${message}`));
};

export const logError = (message: string) => log(message, 'error');
export const logInfo = (message: string) => log(message, 'info');
export const logDebug = (message: string) => log(message, 'debug');
export const logWarn = (message: string) => log(message, 'warn');
