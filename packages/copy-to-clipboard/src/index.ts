import copy from 'copy-to-clipboard';

export function copyToClipboard(text: string) {
  copy(text, { format: 'text/plain' });
}
