import { generateJson } from './gemini-client';
import { sanitizeUserInput } from './sanitize';
import { buildHintSystemInstruction, buildHintUserPrompt } from './prompts/hint.v1';
import {
  HintLevel1Schema,
  HintLevel2Schema,
  HintLevel3Schema,
  HintLevel4Schema,
  HintEntry,
} from '../../schemas/hint';
import { validateHintLeakage } from './validators/hint-leakage';
import { attemptRepair } from './repair';
import { AppError } from '../../lib/errors';
import { z } from 'zod';

export interface HintPipelineOptions {
  level: number;
  problem: string;
  previousEntries?: HintEntry[];
  attempt?: string;
  signal?: AbortSignal;
}

const LEVEL_SCHEMAS: Record<number, any> = {
  1: HintLevel1Schema,
  2: HintLevel2Schema,
  3: HintLevel3Schema,
  4: HintLevel4Schema,
};

export async function runHintPipeline(options: HintPipelineOptions): Promise<HintEntry> {
  const level = options.level;
  const targetSchema = LEVEL_SCHEMAS[level] || HintLevel1Schema;
  const cleanProblem = sanitizeUserInput(options.problem);
  const cleanAttempt = options.attempt ? sanitizeUserInput(options.attempt) : undefined;

  const prevText = options.previousEntries
    ?.map((e) => `[Level ${e.level} ${e.type}]: ${JSON.stringify(e.content)}`)
    .join('\n');

  const systemInstruction = buildHintSystemInstruction(level);
  const userPrompt = buildHintUserPrompt({
    level,
    problem: cleanProblem,
    previousEntriesText: prevText,
    latestAttemptText: cleanAttempt,
  });

  // Initial call
  let res = await generateJson({
    systemInstruction,
    userPrompt,
    temperature: 0.3,
    maxOutputTokens: 800,
    signal: options.signal,
  });

  // 1. Zod Schema Check
  let parsed = targetSchema.safeParse(res.jsonObj);
  let leakage = parsed.success ? validateHintLeakage(level, parsed.data, cleanProblem) : null;

  // If initial response has schema error or leakage violation, attempt single regeneration
  if (!parsed.success || leakage?.hasLeak) {
    const violations = !parsed.success
      ? parsed.error.issues.map((i: any) => `Schema: ${i.path.join('.')}: ${i.message}`)
      : leakage!.violations;

    const repairRes = await attemptRepair({
      systemInstruction,
      originalPrompt: userPrompt,
      invalidOutput: res.rawText,
      violations,
      signal: options.signal,
    });

    parsed = targetSchema.safeParse(repairRes.jsonObj);
    if (!parsed.success) {
      throw new AppError('HINT_UNAVAILABLE', 'Generated hint failed schema validation after regeneration');
    }

    leakage = validateHintLeakage(level, parsed.data, cleanProblem);
    if (leakage.hasLeak) {
      throw new AppError('HINT_UNAVAILABLE', `Generated hint contained spoiler leakage: ${leakage.violations[0]}`);
    }

    res = repairRes;
  }

  return {
    level,
    type: 'hint',
    content: parsed.data!,
    createdAt: new Date(),
  };
}

export interface AttemptEvaluationOptions {
  problem: string;
  level: number;
  attempt: string;
  language?: string;
  signal?: AbortSignal;
}

const AttemptFeedbackSchema = z.object({
  feedback: z.string().min(10).max(1500),
  guidingQuestion: z.string().min(5).max(500),
});

export async function runAttemptEvaluationPipeline(options: AttemptEvaluationOptions): Promise<{
  feedback: string;
  guidingQuestion: string;
}> {
  const cleanProblem = sanitizeUserInput(options.problem);
  const cleanAttempt = sanitizeUserInput(options.attempt);
  const lang = options.language || 'the chosen language';

  const systemInstruction = `You are CodeMentor AI, evaluating a student's attempt to solve a DSA problem.
The learner is currently at Hint Level ${options.level} of 4.
Rules:
1. Objectively evaluate their attempt against the problem: "${cleanProblem}".
2. State what parts of their reasoning or code are correct or on the right track.
3. Identify specific flaws, misconceptions, syntax errors, or unhandled edge cases in their attempt.
4. Provide a focused guiding question that prompts them toward the next step.
5. NEVER reveal the full solution, write complete code, or jump ahead to later hint levels.
6. The feedback must refer to ${lang} if code was submitted.
7. Return JSON matching:
{
  "feedback": "Concise review of the attempt explaining what is sound and what is broken/missing.",
  "guidingQuestion": "A targeted question prompting the next improvement."
}`;

  const userPrompt = `PROBLEM:
${cleanProblem}

STUDENT ATTEMPT:
${cleanAttempt}

Evaluate this attempt and output the JSON response.`;

  const res = await generateJson({
    systemInstruction,
    userPrompt,
    temperature: 0.3,
    maxOutputTokens: 600,
    signal: options.signal,
  });

  const parsed = AttemptFeedbackSchema.safeParse(res.jsonObj);
  if (!parsed.success) {
    throw new AppError('AI_INVALID_OUTPUT', 'Attempt evaluation output was not in expected schema format');
  }

  return parsed.data;
}
