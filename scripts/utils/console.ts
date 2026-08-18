import pc from 'picocolors';

// В picocolors нет аналога colors-темы `rainbow`, поэтому silly-уровень окрашен
// в magenta. Остальные цвета совпадают с прежними.
const themes = {
  silly: pc.magenta,
  info: pc.green,
  help: pc.cyan,
  warn: pc.yellow,
  debug: pc.blue,
  error: pc.red,
} as const;

const log = (message: string, theme: keyof typeof themes = 'warn'): void => {
  console.log(themes[theme](`${message}\n`));
};

export const logError = (message: string) => log(message, 'error');
export const logInfo = (message: string) => log(message, 'info');
export const logHelp = (message: string) => log(message, 'help');
export const logSilly = (message: string) => log(message, 'silly');
export const logDebug = (message: string) => log(message, 'debug');
