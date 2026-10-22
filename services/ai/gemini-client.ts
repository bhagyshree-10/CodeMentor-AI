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

  if (!apiKey || apiKey.trim() === '') {
    throw new AppError(
      'AI_UNAVAILABLE',
      'Gemini API key is not configured. Please set GEMINI_API_KEY in your environment configuration.'
    );
  }

  const modelsToTry = [
    env.GEMINI_MODEL,
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
  ].filter((v, i, a) => a.indexOf(v) === i);

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
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
      lastError = err;
      if (err instanceof AppError) throw err;
      logger.warn(`Model ${modelName} call failed, checking fallback...`, { error: err.message });
      if (err?.message?.includes('503') || err?.message?.includes('404') || err?.message?.includes('429')) {
        continue;
      }
      break;
    }
  }

  logger.error('Gemini API call failed', { error: lastError?.message || String(lastError) });
  throw new AppError(
    'AI_UNAVAILABLE',
    lastError?.message?.includes('API key')
      ? 'Invalid or expired Gemini API key.'
      : `AI analysis service error: ${lastError?.message || 'Model call failed'}`
  );
}
