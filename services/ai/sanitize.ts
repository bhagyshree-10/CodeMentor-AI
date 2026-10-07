import crypto from 'crypto';

export interface CodeFence {
  fenceDelimiter: string;
  sanitizedCode: string;
  wrappedText: string;
}

/**
 * Creates a per-request random delimiter code fence (e.g. <<<CODE-7f3a9c ... CODE-7f3a9c>>>)
 * and strips any occurrence of the delimiter from the input code.
 */
export function buildCodeFence(code: string): CodeFence {
  const randomTag = crypto.randomBytes(4).toString('hex');
  const fenceDelimiter = `CODE-${randomTag}`;

  // Strip any accidental or malicious occurrence of the delimiter
  const sanitizedCode = code
  .replace(/CODE-[0-9a-f]{6,}/gi, 'CODE_REDACTED')
  .replaceAll(fenceDelimiter, 'CODE_REDACTED');

  const wrappedText = `<<<${fenceDelimiter}\n${sanitizedCode}\n${fenceDelimiter}>>>`;

  return {
    fenceDelimiter,
    sanitizedCode,
    wrappedText,
  };
}

/**
 * Normalizes user text inputs, stripping harmful control characters
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // Strip control chars except LF/CR/Tab
    .trim();
}
