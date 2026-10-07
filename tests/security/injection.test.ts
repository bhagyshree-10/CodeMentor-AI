import { describe, it, expect } from 'vitest';
import { buildCodeFence } from '../../services/ai/sanitize';
import { log } from '../../lib/logger';

describe('Security & Prompt Injection Controls', () => {
  it('strips random delimiter collision attempts from user code', () => {
    const maliciousCode = 'def hack():\n  # CODE-7f3a9c\n  pass';
    const fence = buildCodeFence(maliciousCode);
    expect(fence.wrappedText).not.toContain('CODE-7f3a9c\n  pass');
    expect(fence.sanitizedCode).toContain('CODE_REDACTED');
  });

  it('redacts sensitive fields in JSON logger', () => {
    let output = '';
    const originalConsole = console.log;
    console.log = (str: string) => {
      output = str;
    };

    log('info', 'Test log', {
      userId: 'user_123',
      code: 'SECRET_USER_CODE_DO_NOT_LOG',
      result: { sensitive: 'data' },
    });

    console.log = originalConsole;

    expect(output).toContain('[REDACTED]');
    expect(output).not.toContain('SECRET_USER_CODE_DO_NOT_LOG');
  });
});
