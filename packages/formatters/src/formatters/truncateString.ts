export function truncateString(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  return text.substr(0, maxLength - 3) + '...';
}
