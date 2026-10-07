import { generateJson } from './gemini-client';
import { buildCodeFence, sanitizeUserInput } from './sanitize';
import { buildAnalysisSystemInstruction, buildAnalysisUserPrompt, PROMPT_VERSION_ANALYSIS } from './prompts/analysis.v1';
import { AnalysisResultSchema, AnalysisResult } from '../../schemas/analysis';
import { validateSemanticAnalysis } from './validators/semantic-analysis';
import { attemptRepair } from './repair';
import { AppError } from '../../lib/errors';
import { env } from '../../lib/env';
import { SupportedLanguage, AnalysisIntent } from '../../lib/constants';

export interface AnalysisPipelineOptions {
  code: string;
  language: SupportedLanguage;
  intent: AnalysisIntent;
  context?: string;
  signal?: AbortSignal;
}

export interface AnalysisPipelineOutput {
  result: AnalysisResult;
  derivedMistakeTags: string[];
  meta: {
    model: string;
    promptVersion: string;
    schemaVersion: number;
    aiCalls: number;
    repaired: boolean;
    tokensIn?: number;
    tokensOut?: number;
    latencyMs: number;
  };
}

export async function runAnalysisPipeline(options: AnalysisPipelineOptions): Promise<AnalysisPipelineOutput> {
  const startTime = Date.now();
  const totalLines = options.code.split('\n').length;
  const fence = buildCodeFence(options.code);
  const cleanContext = options.context ? sanitizeUserInput(options.context) : undefined;

  const systemInstruction = buildAnalysisSystemInstruction();
  const userPrompt = buildAnalysisUserPrompt({
    language: options.language,
    intent: options.intent,
    context: cleanContext,
    totalLines,
    wrappedCode: fence.wrappedText,
  });

  let aiCalls = 0;
  let repaired = false;

  // Primary Call
  aiCalls++;
  let res = await generateJson({
    systemInstruction,
    userPrompt,
    temperature: 0.2,
    maxOutputTokens: 4096,
    signal: options.signal,
  });

  // Schema validation
  let parsed = AnalysisResultSchema.safeParse(res.jsonObj);
  let semanticVal = parsed.success ? validateSemanticAnalysis(parsed.data, totalLines) : null;

  // If initial pass failed schema or semantic validation, attempt single repair
  if (!parsed.success || !semanticVal?.valid) {
    const violations = !parsed.success
      ? parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      : semanticVal!.errors;

    aiCalls++;
    repaired = true;
    const repairRes = await attemptRepair({
      systemInstruction,
      originalPrompt: userPrompt,
      invalidOutput: res.rawText,
      violations,
      signal: options.signal,
    });

    parsed = AnalysisResultSchema.safeParse(repairRes.jsonObj);
    if (!parsed.success) {
      throw new AppError('AI_INVALID_OUTPUT', 'Analysis report failed schema validation after repair retry');
    }

    semanticVal = validateSemanticAnalysis(parsed.data, totalLines);
    if (!semanticVal.valid) {
      throw new AppError('AI_INVALID_OUTPUT', `Analysis report failed semantic validation: ${semanticVal.errors[0]}`);
    }

    res = repairRes;
  }

  const finalResult = semanticVal!.repairedResult || parsed.data!;

  // Derive mistakeTags server-side from issues
  const tagSet = new Set<string>();
  for (const issue of finalResult.issues) {
    if (issue.tag) {
      tagSet.add(issue.tag);
    }
  }

  const latencyMs = Date.now() - startTime;

  return {
    result: finalResult,
    derivedMistakeTags: Array.from(tagSet),
    meta: {
      model: env.GEMINI_MODEL,
      promptVersion: PROMPT_VERSION_ANALYSIS,
      schemaVersion: 1,
      aiCalls,
      repaired,
      tokensIn: res.tokensIn,
      tokensOut: res.tokensOut,
      latencyMs,
    },
  };
}
