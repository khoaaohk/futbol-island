// Party codes (design 3.3). CSPRNG is injected so the worker, Node relay and tests can each supply their own.
import { CODE_ALPHABET, CODE_LENGTH } from './types';

/** Small blocklist of unlucky consonant runs (substring match). */
export const CODE_BLOCKLIST: readonly string[] = [
  'FCK', 'FUK', 'SHT', 'CNT', 'DCK', 'BCH', 'WTF', 'KKK', 'NGR', 'FKK', 'XXX', 'PSS', 'TTS', 'BST', 'SXX', 'FGT', 'PNS', 'SCK',
];

export function isBlockedCode(code: string): boolean {
  for (let i = 0; i < CODE_BLOCKLIST.length; i++) if (code.indexOf(CODE_BLOCKLIST[i]) >= 0) return true;
  return false;
}

const N = CODE_ALPHABET.length; // 28
const LIMIT = 256 - (256 % N); // 252: bytes >= LIMIT are rejected (no modulo bias)

export function generateCode(rand: (n: number) => Uint8Array): string {
  for (;;) {
    let out = '';
    while (out.length < CODE_LENGTH) {
      const bytes = rand(16);
      for (let i = 0; i < bytes.length && out.length < CODE_LENGTH; i++) {
        if (bytes[i] < LIMIT) out += CODE_ALPHABET[bytes[i] % N];
      }
    }
    if (!isBlockedCode(out)) return out;
  }
}

/** 'k7m-q4r ' -> 'K7MQ4R'; wrong length or any char outside the alphabet -> null. */
export function normalizeCode(input: string): string | null {
  if (typeof input !== 'string' || input.length > 64) return null;
  const s = input.replace(/[\s-]/g, '').toUpperCase();
  if (s.length !== CODE_LENGTH) return null;
  for (let i = 0; i < s.length; i++) if (CODE_ALPHABET.indexOf(s[i]) < 0) return null;
  return s;
}

/** 'K7MQ4R' -> 'K7M-Q4R' */
export function formatCode(code: string): string {
  return code.slice(0, 3) + '-' + code.slice(3);
}
