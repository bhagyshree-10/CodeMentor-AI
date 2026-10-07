import { z } from 'zod';
import { MistakeTagSchema } from './mistake-tags';
import { SUPPORTED_LANGUAGES } from '../lib/constants';

export const IssueTypeSchema = z.enum(['bug', 'edge-case', 'performance']);
export const ConfidenceLevelSchema = z.enum(['low', 'medium', 'high']);

export const WalkthroughBlockSchema = z.object({
  id: z.string(),
  lineStart: z.number().int().min(1),
  lineEnd: z.number().int().min(1),
  title: z.string().max(100),
  explanation: z.string().max(1000),
});

export const IssueSchema = z.object({
  id: z.string(),
  type: IssueTypeSchema,
  tag: MistakeTagSchema.nullable(),
  lineStart: z.number().int().min(1),
  lineEnd: z.number().int().min(1),
  title: z.string().max(120),
  whatIsWrong: z.string().max(1000),
  whyItHappens: z.string().max(1000),
  evidence: z.string().max(1000),
  confidence: ConfidenceLevelSchema,
});

export const ImprovementSchema = z
  .object({
    approach: z.string().max(1000),
    changes: z.array(
      z.object({
        issueId: z.string().nullable(),
        description: z.string().max(500),
      })
    ),
    code: z.string(),
    whyBetter: z.string().max(1000),
  })
  .nullable();

export const ComplexitySchema = z.object({
  original: z.object({
    time: z.string().max(100),
    space: z.string().max(100),
  }),
  improved: z
    .object({
      time: z.string().max(100),
      space: z.string().max(100),
    })
    .nullable(),
  reasoning: z.string().max(1000),
  confidence: ConfidenceLevelSchema,
});

export const EdgeCaseSchema = z.object({
  input: z.string().max(300),
  expectedBehavior: z.string().max(500),
  handledByOriginal: z.enum(['yes', 'no', 'unsure']),
});

export const AnalysisResultSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().max(80),
  summary: z.string().max(300),
  walkthrough: z.array(WalkthroughBlockSchema).min(1).max(8),
  issues: z.array(IssueSchema).max(6),
  improvement: ImprovementSchema,
  complexity: ComplexitySchema,
  edgeCases: z.array(EdgeCaseSchema).max(5),
  overallConfidence: z.object({
    level: ConfidenceLevelSchema,
    caveats: z.array(z.string().max(300)),
  }),
  takeaways: z.object({
    remember: z.array(z.string().max(300)).min(1).max(3),
    selfCheck: z.string().max(500),
  }),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type WalkthroughBlock = z.infer<typeof WalkthroughBlockSchema>;
