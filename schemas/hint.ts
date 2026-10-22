import { z } from 'zod';

export const HintLevel1Schema = z.object({
  restatement: z.string().max(1000),
  constraints: z.array(z.string().max(300)).max(5),
  clarifyingQuestions: z.array(z.string().max(300)).max(3),
  workedExample: z.string().max(1000),
  edgeCasesToConsider: z.array(z.string().max(300)).max(5),
});

export const HintLevel2Schema = z.object({
  observation: z.string().max(1000),
  guidingQuestion: z.string().max(500),
});

export const HintLevel3Schema = z.object({
  techniqueCategory: z.string().max(200),
  whyItFits: z.string().max(800),
  guidingQuestion: z.string().max(500),
});

export const HintLevel4Schema = z.object({
  steps: z.array(z.string().max(500)).min(1).max(8),
});

export type HintLevel1 = z.infer<typeof HintLevel1Schema>;
export type HintLevel2 = z.infer<typeof HintLevel2Schema>;
export type HintLevel3 = z.infer<typeof HintLevel3Schema>;
export type HintLevel4 = z.infer<typeof HintLevel4Schema>;

export const HintEntrySchema = z.object({
  level: z.number().int().min(1).max(4),
  type: z.enum(['hint', 'attempt-feedback']),
  content: z.union([
    HintLevel1Schema,
    HintLevel2Schema,
    HintLevel3Schema,
    HintLevel4Schema,
    z.object({
      feedback: z.string().max(1500),
      guidingQuestion: z.string().max(500),
    }),
  ]),
  attemptText: z.string().optional(),
  createdAt: z.date(),
});

export type HintEntry = z.infer<typeof HintEntrySchema>;

export const HintSessionSchema = z.object({
  problem: z.string(),
  currentLevel: z.number().int().min(0).max(4),
  status: z.enum(['active', 'completed']),
  entries: z.array(HintEntrySchema),
});

export type HintSessionState = z.infer<typeof HintSessionSchema>;
