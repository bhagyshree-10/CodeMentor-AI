import { generateJson, GeminiResponse } from './gemini-client';
import { logger } from '../../lib/logger';

export async function attemptRepair(options: {
  systemInstruction: string;
  originalPrompt: string;
  invalidOutput: string;
  violations: string[];
  signal?: AbortSignal;
}): Promise<GeminiResponse> {
  logger.info('Attempting single AI repair pass for validation failures', {
    violationCount: options.violations.length,
  });

  const repairUserPrompt = `${options.originalPrompt}

PREVIOUS INVALID RESPONSE:
${options.invalidOutput}

VALIDATION VIOLATIONS TO FIX:
${options.violations.map((v) => `- ${v}`).join('\n')}

Fix all reported violations and output a fully compliant JSON object.`;

  return generateJson({
    systemInstruction: options.systemInstruction,
    userPrompt: repairUserPrompt,
    temperature: 0.0,
    signal: options.signal,
  });
}
