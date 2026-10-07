import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../../lib/language/detect';

describe('Language Detector', () => {
  it('detects Python accurately', () => {
    const code = 'def two_sum(nums, target):\n    for i in range(len(nums)):\n        print("hello")';
    const res = detectLanguage(code);
    expect(res.language).toBe('python');
    expect(res.confidence).toBe('high');
  });

  it('detects TypeScript with interfaces', () => {
    const code = 'interface User {\n  id: string;\n  name: string;\n}\nconst u: User = { id: "1", name: "test" };';
    const res = detectLanguage(code);
    expect(res.language).toBe('typescript');
  });

  it('detects C++ includes', () => {
    const code = '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello"; return 0; }';
    const res = detectLanguage(code);
    expect(res.language).toBe('cpp');
  });

  it('returns low confidence on ambiguous empty text', () => {
    const res = detectLanguage('   ');
    expect(res.language).toBeNull();
    expect(res.confidence).toBe('low');
  });
});
