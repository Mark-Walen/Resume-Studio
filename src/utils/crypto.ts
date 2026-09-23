/**
 * Client-Side API Key Security & Obfuscation Module
 * Prevents plain-text leakage in DevTools DOM inspect, page source dumps, and LocalStorage.
 */

const SALT_PREFIX = 'SECURE_VAULT_V2::';
const KEY_CHAR_OFFSET = 17;

export function encryptApiKey(plainKey: string): string {
  if (!plainKey) return '';
  try {
    const encoded = encodeURIComponent(plainKey);
    let shifted = '';
    for (let i = 0; i < encoded.length; i++) {
      const code = encoded.charCodeAt(i);
      shifted += String.fromCharCode((code + KEY_CHAR_OFFSET) ^ ((i % 5) + 3));
    }
    const b64 = btoa(unescape(encodeURIComponent(shifted)));
    return `${SALT_PREFIX}${b64}`;
  } catch (err) {
    console.warn('Key encryption error, falling back to base64', err);
    return `${SALT_PREFIX}${btoa(plainKey)}`;
  }
}

export function decryptApiKey(encryptedKey: string): string {
  if (!encryptedKey) return '';
  if (!encryptedKey.startsWith(SALT_PREFIX)) {
    // If it's legacy unencrypted key
    return encryptedKey;
  }

  try {
    const payload = encryptedKey.substring(SALT_PREFIX.length);
    const shifted = decodeURIComponent(escape(atob(payload)));
    let decoded = '';
    for (let i = 0; i < shifted.length; i++) {
      const shiftedCode = shifted.charCodeAt(i);
      const originalCode = (shiftedCode ^ ((i % 5) + 3)) - KEY_CHAR_OFFSET;
      decoded += String.fromCharCode(originalCode);
    }
    return decodeURIComponent(decoded);
  } catch (err) {
    try {
      const payload = encryptedKey.substring(SALT_PREFIX.length);
      return atob(payload);
    } catch {
      return '';
    }
  }
}

/**
 * Mask an API key safely for display without revealing sensitive characters.
 * e.g., sk-proj-1234567890abcdef -> sk-pr••••••••••cdef
 */
export function maskApiKey(plainKey: string): string {
  if (!plainKey) return '';
  if (plainKey.length <= 8) return '••••••••';
  const prefix = plainKey.slice(0, 5);
  const suffix = plainKey.slice(-4);
  return `${prefix}${'•'.repeat(Math.max(6, plainKey.length - 9))}${suffix}`;
}
