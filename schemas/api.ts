import { z } from 'zod';
import { SUPPORTED_LANGUAGES, INTENTS, LIMITS } from '../lib/constants';

export const AnalyzeRequestSchema = z.object({
  code: z
    .string()
    .min(1, 'Code cannot be empty')
    .max(LIMITS.MAX_CODE_CHARS, `Code exceeds ${LIMITS.MAX_CODE_CHARS} characters`)
    .refine((val) => val.split('\n').length <= LIMITS.MAX_CODE_LINES, {
      message: `Code exceeds ${LIMITS.MAX_CODE_LINES} lines`,
    }),
  language: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({ message: 'Unsupported or unselected language' }),
  }),
  intent: z.enum(INTENTS, {
    errorMap: () => ({ message: 'Invalid analysis intent' }),
  }),
  context: z.string().max(LIMITS.MAX_CONTEXT_CHARS).optional(),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const HintStartActionSchema = z.object({
  action: z.literal('start'),
  problem: z
    .string()
    .min(1, 'Problem description cannot be empty')
    .max(LIMITS.MAX_PROBLEM_CHARS, `Problem description exceeds ${LIMITS.MAX_PROBLEM_CHARS} characters`),
  language: z.enum(SUPPORTED_LANGUAGES).optional(),
  attempt: z.string().max(LIMITS.MAX_CODE_CHARS).optional(),
});

export const HintNextActionSchema = z.object({
  action: z.literal('next'),
  analysisId: z.string().min(1, 'Analysis ID is required'),
});

export const HintAttemptActionSchema = z.object({
  action: z.literal('attempt'),
  analysisId: z.string().min(1, 'Analysis ID is required'),
  attempt: z
    .string()
    .min(1, 'Attempt text cannot be empty')
    .max(LIMITS.MAX_CODE_CHARS, `Attempt exceeds ${LIMITS.MAX_CODE_CHARS} characters`),
});

export const HintRequestSchema = z.discriminatedUnion('action', [
  HintStartActionSchema,
  HintNextActionSchema,
  HintAttemptActionSchema,
]);

export type HintRequest = z.infer<typeof HintRequestSchema>;

export const FeedbackRequestSchema = z.object({
  analysisId: z.string().min(1),
  kind: z.literal('incorrect'),
  note: z.string().max(500).optional(),
});

export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;

export const PatchAccountSchema = z.object({
  storeCode: z.boolean(),
});

export type PatchAccountRequest = z.infer<typeof PatchAccountSchema>;
