import crypto from 'crypto';

/**
 * Normalizes code text (trims whitespace, converts CRLF to LF)
 * and returns its SHA-256 hex digest.
 */
export function sha256(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}
