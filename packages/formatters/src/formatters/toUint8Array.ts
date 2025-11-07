import { Base64 } from 'js-base64';

export function toUint8Array(str: string): Uint8Array {
  return Base64.toUint8Array(str);
}
