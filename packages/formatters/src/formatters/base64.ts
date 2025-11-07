function bytesToBase64(bytes: Uint8Array) {
  const binString = Array.from(bytes, byte => String.fromCodePoint(byte)).join('');
  return window.btoa(binString);
}

function base64ToBytes(base64: string) {
  const binString = atob(base64);
  return Uint8Array.from(binString, m => m.codePointAt(0) ?? 0);
}

export function stringToBase64(str: string) {
  return bytesToBase64(new TextEncoder().encode(str));
}

export function base64ToString(base64: string) {
  return new TextDecoder().decode(base64ToBytes(base64));
}
