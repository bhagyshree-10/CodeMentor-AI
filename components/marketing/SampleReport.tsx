'use client';

import React from 'react';
import { AnalysisReport } from '../analysis/AnalysisReport';
import { AnalysisResult } from '../../schemas/analysis';

const SAMPLE_ANALYSIS: AnalysisResult = {
  schemaVersion: 1,
  title: 'Nested Loop Pair Lookup Optimization',
  summary: 'The implementation searches for matching sum pairs using nested loops, resulting in quadratic time complexity O(n^2).',
  walkthrough: [
    {
      id: 'w1',
      lineStart: 1,
      lineEnd: 2,
      title: 'Outer Array Scan',
      explanation: 'Iterates through each number in the array sequentially.',
    },
    {
      id: 'w2',
      lineStart: 3,
      lineEnd: 5,
      title: 'Inner Redundant Scan',
      explanation: 'Scans the remaining list for a complement matching the target sum.',
    },
  ],
  issues: [
    {
      id: 'iss_1',
      type: 'performance',
      tag: 'inefficient-lookup',
      lineStart: 3,
      lineEnd: 5,
      title: 'Quadratic Inner Lookup',
      whatIsWrong: 'Scanning the list inside another loop causes O(n^2) runtime.',
      whyItHappens: 'Looking up values sequentially requires visiting every element for each outer iteration.',
      evidence: 'For 10,000 numbers, the loop performs up to 50,000,000 index checks.',
      confidence: 'high',
    },
  ],
  improvement: {
    approach: 'Store visited numbers in a key-value dictionary for instant O(1) complement lookup.',
    changes: [
      { issueId: 'iss_1', description: 'Replace inner search loop with a hash table lookup.' },
    ],
    code: `def solution(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
    whyBetter: 'Reduces time complexity from O(n^2) quadratic to O(n) linear.',
  },
  complexity: {
    original: { time: 'O(n^2)', space: 'O(1)' },
    improved: { time: 'O(n)', space: 'O(n)' },
    reasoning: 'Traverses the list in a single pass while hash table lookups take O(1) time.',
    confidence: 'high',
  },
  edgeCases: [
    {
      input: 'nums = [], target = 5',
      expectedBehavior: 'Return empty list without raising error',
      handledByOriginal: 'yes',
    },
  ],
  overallConfidence: {
    level: 'high',
    caveats: ['Assumes standard python dictionary hashing.'],
  },
  takeaways: {
    remember: [
      'Prefer dictionary/hash lookups over nested loops when finding pairs.',
      'Always consider space-time trade-offs.',
    ],
    selfCheck: 'How would you solve this if space complexity were strictly constrained to O(1)?',
  },
};

const ORIGINAL_SAMPLE_CODE = `def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`;

export function SampleReport() {
  return (
    <section id="sample-report" className="py-16 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">Real Learning Report Sample</h2>
        <p className="text-sm text-text-muted">No black boxes. Every analysis breaks code down into structured chapters.</p>
      </div>

      <div className="border border-border rounded-lg shadow-lg overflow-hidden bg-surface">
        <AnalysisReport
          analysisId="sample_report_demo"
          originalCode={ORIGINAL_SAMPLE_CODE}
          result={SAMPLE_ANALYSIS}
          insight={{
            tag: 'inefficient-lookup',
            earlierCount: 3,
            href: '/app/history?tag=inefficient-lookup',
            message: "You've hit inefficient-lookup in 3 earlier analyses.",
          }}
        />
      </div>
    </section>
  );
}
