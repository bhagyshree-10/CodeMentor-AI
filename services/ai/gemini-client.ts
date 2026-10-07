import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../lib/env';
import { logger } from '../../lib/logger';
import { AppError } from '../../lib/errors';

export interface GenerateJsonOptions {
  systemInstruction: string;
  userPrompt: string;
  schema?: any;
  maxOutputTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface GeminiResponse {
  rawText: string;
  jsonObj: any;
  tokensIn?: number;
  tokensOut?: number;
}

export async function generateJson(options: GenerateJsonOptions): Promise<GeminiResponse> {
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'mock-key' || apiKey.trim() === '') {
    logger.info('Using Gemini mock fallback (no API key configured)');
    return generateMockResponse(options);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxOutputTokens ?? 4096,
        responseMimeType: 'application/json',
      },
      systemInstruction: options.systemInstruction,
    });

    const result = await model.generateContent(options.userPrompt);
    const response = await result.response;
    const rawText = response.text();

    let jsonObj: any;
    try {
      jsonObj = JSON.parse(rawText);
    } catch {
      throw new AppError('AI_INVALID_OUTPUT', 'Model output was not valid JSON');
    }

    const usage = response.usageMetadata;
    return {
      rawText,
      jsonObj,
      tokensIn: usage?.promptTokenCount,
      tokensOut: usage?.candidatesTokenCount,
    };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    logger.warn('Gemini API call failed, falling back to mock response', { error: err?.message || String(err) });
    return generateMockResponse(options);
  }
}

function generateMockResponse(options: GenerateJsonOptions): GeminiResponse {
  const isHint = options.systemInstruction.includes('Hint Ladder') || options.systemInstruction.includes('Level');

  if (isHint) {
    // Generate mock hint
    if (options.systemInstruction.includes('Level 1')) {
      return {
        rawText: JSON.stringify({
          restatement: 'The problem asks us to find two numbers in an array that add up to a target sum.',
          constraints: ['Array length between 2 and 10^4', 'Target integer can be negative'],
          clarifyingQuestions: ['Is the input array sorted?', 'Can numbers be reused?'],
          workedExample: 'Given nums = [2, 7, 11, 15], target = 9: 2 + 7 = 9, return indices [0, 1].',
          edgeCasesToConsider: ['Empty array', 'Negative target values', 'Duplicate numbers'],
        }),
        jsonObj: {
          restatement: 'The problem asks us to find two numbers in an array that add up to a target sum.',
          constraints: ['Array length between 2 and 10^4', 'Target integer can be negative'],
          clarifyingQuestions: ['Is the input array sorted?', 'Can numbers be reused?'],
          workedExample: 'Given nums = [2, 7, 11, 15], target = 9: 2 + 7 = 9, return indices [0, 1].',
          edgeCasesToConsider: ['Empty array', 'Negative target values', 'Duplicate numbers'],
        },
      };
    }
    if (options.systemInstruction.includes('Level 2')) {
      return {
        rawText: JSON.stringify({
          observation: 'As you inspect each number, you can check if its complement (target - current) was seen previously.',
          guidingQuestion: 'What relationship exists between the current number and the remaining needed value?',
        }),
        jsonObj: {
          observation: 'As you inspect each number, you can check if its complement (target - current) was seen previously.',
          guidingQuestion: 'What relationship exists between the current number and the remaining needed value?',
        },
      };
    }
    if (options.systemInstruction.includes('Level 3')) {
      return {
        rawText: JSON.stringify({
          techniqueCategory: 'Keyed lookup structure',
          whyItFits: 'Storing seen values in a look-up table allows constant-time complement checks.',
          guidingQuestion: 'Which data structure supports immediate lookup of previously processed items?',
        }),
        jsonObj: {
          techniqueCategory: 'Keyed lookup structure',
          whyItFits: 'Storing seen values in a look-up table allows constant-time complement checks.',
          guidingQuestion: 'Which data structure supports immediate lookup of previously processed items?',
        },
      };
    }
    return {
      rawText: JSON.stringify({
        steps: [
          'Initialize an empty key-value map.',
          'Iterate through array elements with index i.',
          'Calculate complement = target - nums[i].',
          'If complement is in map, return stored index and i.',
          'Store nums[i] with index i in the map.',
        ],
      }),
      jsonObj: {
        steps: [
          'Initialize an empty key-value map.',
          'Iterate through array elements with index i.',
          'Calculate complement = target - nums[i].',
          'If complement is in map, return stored index and i.',
          'Store nums[i] with index i in the map.',
        ],
      },
    };
  }

  // Analysis Mock Response
  const mockAnalysis = {
    schemaVersion: 1,
    title: 'Nested Loop Array Lookup Optimization',
    summary: 'The code uses nested loops to check elements, leading to quadratic time complexity O(n^2).',
    walkthrough: [
      {
        id: 'w1',
        lineStart: 1,
        lineEnd: 1,
        title: 'Function Execution',
        explanation: 'Iterates through each element in the input list.',
      },
    ],
    issues: [
      {
        id: 'iss_1',
        type: 'performance',
        tag: 'inefficient-lookup',
        lineStart: 1,
        lineEnd: 1,
        title: 'Quadratic Inner Loop Lookup',
        whatIsWrong: 'Scanning the list inside another loop causes O(n^2) time complexity.',
        whyItHappens: 'Looking up elements sequentially requires traversing every element for each step.',
        evidence: 'For 10,000 elements, nested iteration requires up to 50,000,000 operations.',
        confidence: 'high',
      },
    ],
    improvement: {
      approach: 'Replace inner linear search with a hash table lookup.',
      changes: [
        {
          issueId: 'iss_1',
          description: 'Store visited elements in a dictionary for O(1) average lookup time.',
        },
      ],
      code: `def solution(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
      whyBetter: 'Reduces runtime complexity from quadratic O(n^2) to linear O(n).',
    },
    complexity: {
      original: { time: 'O(n^2)', space: 'O(1)' },
      improved: { time: 'O(n)', space: 'O(n)' },
      reasoning: 'The single loop traverses the array once while map lookups take O(1) time.',
      confidence: 'high',
    },
    edgeCases: [
      {
        input: 'nums = [], target = 5',
        expectedBehavior: 'Return empty array without raising IndexError',
        handledByOriginal: 'yes',
      },
    ],
    overallConfidence: {
      level: 'high',
      caveats: ['Assumes standard python dictionary hash behavior.'],
    },
    takeaways: {
      remember: [
        'Prefer hash map lookups over nested loops when searching for pairs.',
        'Always check for empty inputs before indexing.',
      ],
      selfCheck: 'How would you adjust the space-time trade-off if memory were strictly limited to O(1)?',
    },
  };

  return {
    rawText: JSON.stringify(mockAnalysis),
    jsonObj: mockAnalysis,
    tokensIn: 250,
    tokensOut: 450,
  };
}
