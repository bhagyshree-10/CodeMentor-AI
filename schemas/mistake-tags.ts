import { z } from 'zod';

export const MISTAKE_TAGS = [
  'off-by-one',
  'null-handling',
  'missing-edge-case',
  'inefficient-lookup',
  'mutation-side-effect',
  'incorrect-condition',
  'incorrect-loop-bound',
  'unnecessary-computation',
] as const;

export type MistakeTag = (typeof MISTAKE_TAGS)[number];

export const MistakeTagSchema = z.enum(MISTAKE_TAGS);

export const MISTAKE_TAG_DESCRIPTIONS: Record<MistakeTag, string> = {
  'off-by-one': 'Index or loop iteration count is one too high or one too low.',
  'null-handling': 'Missing check for null, undefined, or empty values before accessing properties.',
  'missing-edge-case': 'Empty inputs, single-element collections, boundary values, or duplicates not handled.',
  'inefficient-lookup': 'Repeated linear search where a hash map, set, or keyed index should be used.',
  'mutation-side-effect': 'Unintended modification of input data or shared state.',
  'incorrect-condition': 'Flawed boolean evaluation, wrong comparison operator, or inverted logic.',
  'incorrect-loop-bound': 'Loop starts, ends, or updates with incorrect boundary boundaries or step conditions.',
  'unnecessary-computation': 'Repeated or redundant operations inside loops that could be hoisted or eliminated.',
};
