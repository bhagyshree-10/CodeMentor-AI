const TECHNIQUE_DENYLIST = [
  'hash map',
  'hash table',
  'hashtable',
  'hashmap',
  'dictionary',
  'set',
  'two pointers',
  'two pointer',
  'sliding window',
  'dynamic programming',
  'memoization',
  'binary search',
  'heap',
  'priority queue',
  'stack',
  'queue',
  'bfs',
  'dfs',
  'breadth first',
  'depth first',
  'greedy',
  'backtracking',
  'trie',
  'union-find',
  'disjoint set',
  'sorting',
  'quicksort',
  'mergesort',
];

export interface LeakageCheckResult {
  hasLeak: boolean;
  violations: string[];
}

export function validateHintLeakage(
  level: number,
  hintObj: any,
  problemText: string
): LeakageCheckResult {
  const violations: string[] = [];
  const textContent = JSON.stringify(hintObj).toLowerCase();
  const lowerProblem = problemText.toLowerCase();

  // Rule 1: No code fences or code syntax
  if (textContent.includes('```') || textContent.includes('````')) {
    violations.push('Contains code fence markers');
  }

  const syntaxPatterns = [
    /;\s*$/,
    /\bdef\s+\w+/,
    /\bfor\s*\(/,
    /\bwhile\s*\(/,
    /#include\b/,
    /\bimport\s+\w+/,
    /=>/,
  ];

  // Helper to extract all text strings from hint object
  const extractStrings = (obj: any): string[] => {
    if (typeof obj === 'string') return [obj];
    if (Array.isArray(obj)) return obj.flatMap(extractStrings);
    if (typeof obj === 'object' && obj !== null) return Object.values(obj).flatMap(extractStrings);
    return [];
  };

  const textValues = extractStrings(hintObj);
  for (const textVal of textValues) {
    const valLines = textVal.split('\n');
    for (const line of valLines) {
      for (const pat of syntaxPatterns) {
        if (pat.test(line)) {
          violations.push(`Line matches code syntax pattern: ${line.trim()}`);
          break;
        }
      }
    }
  }

  // Rule 2: Technique denylist for Level 1 & Level 2
  if (level === 1 || level === 2) {
    for (const tech of TECHNIQUE_DENYLIST) {
      if (textContent.includes(tech) && !lowerProblem.includes(tech)) {
        violations.push(`Level ${level} hint leaks forbidden technique keyword: "${tech}"`);
      }
    }
  }

  // Rule 3: Complexity claims for Level 1 - 3
  if (level >= 1 && level <= 3) {
    if (
      /\bo\(/i.test(textContent) ||
      textContent.includes('linear time') ||
      textContent.includes('quadratic time') ||
      textContent.includes('logarithmic time') ||
      textContent.includes('big-o')
    ) {
      violations.push(`Level ${level} hint contains forbidden complexity claim`);
    }
  }

  // Rule 4: Level 3 step lists forbidden
  if (level === 3 && Array.isArray(hintObj.steps)) {
    violations.push('Level 3 hint contains forbidden step list');
  }

  // Rule 5: Level 4 pseudocode forbidden
  if (level === 4) {
    const pseudocodeKeywords = ['\bwhile\b', '\bif ... then\b', ':=', '\breturn\b'];
    for (const kw of pseudocodeKeywords) {
      if (new RegExp(kw).test(textContent)) {
        violations.push(`Level 4 algorithm outline contains forbidden pseudocode keyword: ${kw}`);
      }
    }
  }

  return {
    hasLeak: violations.length > 0,
    violations,
  };
}
