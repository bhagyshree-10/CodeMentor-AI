import { describe, it, expect } from 'vitest';
import { validateSemanticAnalysis } from '../../services/ai/validators/semantic-analysis';
import { AnalysisResult } from '../../schemas/analysis';

describe('Semantic Analysis Validator', () => {
  const validReport: AnalysisResult = {
    schemaVersion: 1,
    title: 'Valid Report',
    summary: 'Test summary',
    walkthrough: [{ id: 'w1', lineStart: 1, lineEnd: 2, title: 'Step 1', explanation: 'Expl' }],
    issues: [
      {
        id: 'iss_1',
        type: 'bug',
        tag: 'off-by-one',
        lineStart: 1,
        lineEnd: 2,
        title: 'Off-by-one',
        whatIsWrong: 'Wrong',
        whyItHappens: 'Reason',
        evidence: 'Input: []',
        confidence: 'low',
      },
    ],
    improvement: null,
    complexity: {
      original: { time: 'O(1)', space: 'O(1)' },
      improved: null,
      reasoning: 'Reasoning',
      confidence: 'high',
    },
    edgeCases: [],
    overallConfidence: { level: 'high', caveats: [] },
    takeaways: { remember: ['Check bounds'], selfCheck: 'Question?' },
  };

  it('detects line number out of bounds', () => {
    const invalid = {
      ...validReport,
      walkthrough: [{ id: 'w1', lineStart: 1, lineEnd: 50, title: 'OutOfBounds', explanation: 'Expl' }],
    };
    const res = validateSemanticAnalysis(invalid, 10);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('out of bounds');
  });

  it('applies confidence clamp rule if issue confidence is low', () => {
    const res = validateSemanticAnalysis(validReport, 10);
    expect(res.valid).toBe(true);
    expect(res.confidenceClamped).toBe(true);
    expect(res.repairedResult?.overallConfidence.level).toBe('medium');
  });
});
