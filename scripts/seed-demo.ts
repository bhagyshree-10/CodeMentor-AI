import { AnalysesRepository } from '../models/analyses.repo';
import { DEMO_USER } from '../lib/session';

async function main() {
  console.log('🌱 Seeding demo history for interview demonstration...');

  const demoItems = [
    {
      userId: DEMO_USER.id,
      kind: 'analysis' as const,
      title: 'Nested Loop Array Lookup Optimization',
      language: 'python' as const,
      intent: 'improve' as const,
      code: `def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []`,
      codeLineCount: 7,
      mistakeTags: ['inefficient-lookup'],
      result: {
        schemaVersion: 1 as const,
        title: 'Nested Loop Array Lookup Optimization',
        summary: 'The code uses nested loops to check elements, leading to quadratic time complexity O(n^2).',
        walkthrough: [
          { id: 'w1', lineStart: 1, lineEnd: 2, title: 'Outer loop', explanation: 'Scans elements sequentially.' },
        ],
        issues: [
          {
            id: 'iss_1',
            type: 'performance' as const,
            tag: 'inefficient-lookup' as const,
            lineStart: 3,
            lineEnd: 5,
            title: 'Quadratic Inner Lookup',
            whatIsWrong: 'Nested loop scanning causes O(n^2) runtime.',
            whyItHappens: 'Sequential lookup visits every item.',
            evidence: 'For 10k items, 50 million iterations.',
            confidence: 'high' as const,
          },
        ],
        improvement: {
          approach: 'Use dictionary for O(1) lookups.',
          changes: [{ issueId: 'iss_1', description: 'Replace inner loop with dictionary check.' }],
          code: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []',
          whyBetter: 'Reduces runtime complexity to O(n).',
        },
        complexity: {
          original: { time: 'O(n^2)', space: 'O(1)' },
          improved: { time: 'O(n)', space: 'O(n)' },
          reasoning: 'Single pass with dictionary lookup.',
          confidence: 'high' as const,
        },
        edgeCases: [{ input: 'nums = []', expectedBehavior: 'Returns []', handledByOriginal: 'yes' as const }],
        overallConfidence: { level: 'high' as const, caveats: [] },
        takeaways: { remember: ['Use hash maps for lookups.'], selfCheck: 'What if memory is O(1)?' },
      },
      meta: { model: 'gemini-1.5-flash', promptVersion: 'analysis.v1', schemaVersion: 1, aiCalls: 1, repaired: false },
    },
    {
      userId: DEMO_USER.id,
      kind: 'analysis' as const,
      title: 'Off-by-One Range Boundary Bug',
      language: 'python' as const,
      intent: 'debug' as const,
      code: `def get_first_n(arr, n):\n    result = []\n    for i in range(0, n + 1):\n        result.append(arr[i])\n    return result`,
      codeLineCount: 5,
      mistakeTags: ['off-by-one', 'missing-edge-case'],
      result: {
        schemaVersion: 1 as const,
        title: 'Off-by-One Range Boundary Bug',
        summary: 'Range end includes n+1 which accesses arr[n] out of bounds.',
        walkthrough: [
          { id: 'w1', lineStart: 3, lineEnd: 4, title: 'Range iteration', explanation: 'Iterates n+1 times.' },
        ],
        issues: [
          {
            id: 'iss_1',
            type: 'bug' as const,
            tag: 'off-by-one' as const,
            lineStart: 3,
            lineEnd: 3,
            title: 'Index Out of Range',
            whatIsWrong: 'Range end boundary includes n+1.',
            whyItHappens: 'Adding +1 causes index out of range for n elements.',
            evidence: 'arr=[10], n=1 -> attempts to read arr[1], raises IndexError.',
            confidence: 'high' as const,
          },
        ],
        improvement: {
          approach: 'Use range(0, n).',
          changes: [{ issueId: 'iss_1', description: 'Remove +1 from range.' }],
          code: 'def get_first_n(arr, n):\n    return arr[:n]',
          whyBetter: 'Safely slices array.',
        },
        complexity: {
          original: { time: 'O(n)', space: 'O(n)' },
          improved: { time: 'O(n)', space: 'O(n)' },
          reasoning: 'Copies n elements.',
          confidence: 'high' as const,
        },
        edgeCases: [{ input: 'n=0', expectedBehavior: 'Returns []', handledByOriginal: 'no' as const }],
        overallConfidence: { level: 'high' as const, caveats: [] },
        takeaways: { remember: ['Check loop upper bounds.'], selfCheck: 'How does slice syntax handle out of bounds?' },
      },
      meta: { model: 'gemini-1.5-flash', promptVersion: 'analysis.v1', schemaVersion: 1, aiCalls: 1, repaired: false },
    },
    {
      userId: DEMO_USER.id,
      kind: 'analysis' as const,
      title: 'Missing Null Check Before Property Access',
      language: 'javascript' as const,
      intent: 'debug' as const,
      code: `function getUserCity(user) {\n  return user.profile.address.city;\n}`,
      codeLineCount: 3,
      mistakeTags: ['null-handling', 'missing-edge-case'],
      result: {
        schemaVersion: 1 as const,
        title: 'Missing Null Check Before Property Access',
        summary: 'Directly accessing user.profile.address throws TypeError if any nested field is undefined.',
        walkthrough: [
          { id: 'w1', lineStart: 2, lineEnd: 2, title: 'Nested access', explanation: 'Dereferences profile and address.' },
        ],
        issues: [
          {
            id: 'iss_1',
            type: 'bug' as const,
            tag: 'null-handling' as const,
            lineStart: 2,
            lineEnd: 2,
            title: 'Uncaught TypeError on null',
            whatIsWrong: 'Missing optional chaining or null checks.',
            whyItHappens: 'If user.profile is undefined, accessing .address throws.',
            evidence: 'Input: user = {} -> TypeError: Cannot read property address of undefined.',
            confidence: 'high' as const,
          },
        ],
        improvement: {
          approach: 'Use optional chaining user?.profile?.address?.city.',
          changes: [{ issueId: 'iss_1', description: 'Add optional chaining operator ?.' }],
          code: 'function getUserCity(user) {\n  return user?.profile?.address?.city || null;\n}',
          whyBetter: 'Prevents runtime crashes.',
        },
        complexity: {
          original: { time: 'O(1)', space: 'O(1)' },
          improved: { time: 'O(1)', space: 'O(1)' },
          reasoning: 'Constant time object dereference.',
          confidence: 'high' as const,
        },
        edgeCases: [{ input: 'user = null', expectedBehavior: 'Returns null', handledByOriginal: 'no' as const }],
        overallConfidence: { level: 'high' as const, caveats: [] },
        takeaways: { remember: ['Always validate object property chains.'], selfCheck: 'When is nullish coalescing preferable to logical OR?' },
      },
      meta: { model: 'gemini-1.5-flash', promptVersion: 'analysis.v1', schemaVersion: 1, aiCalls: 1, repaired: false },
    },
  ];

  for (const item of demoItems) {
    await AnalysesRepository.create(item);
  }

  console.log(`✅ Seeded ${demoItems.length} demo analyses into database.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error seeding demo data:', err);
  process.exit(1);
});
