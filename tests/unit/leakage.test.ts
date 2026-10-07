import { describe, it, expect } from 'vitest';
import { validateHintLeakage } from '../../services/ai/validators/hint-leakage';

describe('Hint Leakage Validator', () => {
  it('accepts clean Level 1 hint', () => {
    const hint = {
      restatement: 'Find two items that sum to a target value.',
      constraints: ['Array size > 1'],
    };
    const res = validateHintLeakage(1, hint, 'Find pair summing to target');
    expect(res.hasLeak).toBe(false);
  });

  it('rejects forbidden technique keywords at Level 1', () => {
    const leakyHint = {
      restatement: 'Use a hash map to look up items.',
    };
    const res = validateHintLeakage(1, leakyHint, 'Find pair summing to target');
    expect(res.hasLeak).toBe(true);
    expect(res.violations[0]).toContain('hash map');
  });

  it('rejects code fences in hint output', () => {
    const leakyHint = {
      observation: '```python\nfor i in range(n):\n```',
    };
    const res = validateHintLeakage(2, leakyHint, 'Find pair');
    expect(res.hasLeak).toBe(true);
  });
});
