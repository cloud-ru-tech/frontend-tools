export function isValidPackageTitle(input: string): boolean {
  return /^(?:[0-9a-zA-Z]+ )*[0-9a-zA-Z]*$/.test(input);
}
