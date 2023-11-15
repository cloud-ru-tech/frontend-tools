const ERROR_TEMPLATE = '\x1b[31m%s\x1b[0m'; //red
const INFO_TEMPLATE = '\x1b[36m%s\x1b[0m'; //cyan

export function log(message: string): void {
  console.log(INFO_TEMPLATE, `@cloud-ru/ft-config-commit-message > ${message}`);
}

export function error(err: string): void {
  console.error(ERROR_TEMPLATE, `@cloud-ru/ft-config-commit-message > ${err}`);
}
