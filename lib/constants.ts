export const SUPPORTED_LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'java',
  'c',
  'cpp',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const INTENTS = ['understand', 'debug', 'improve'] as const;
export type AnalysisIntent = (typeof INTENTS)[number];

export const LIMITS = {
  MAX_CODE_CHARS: 12000,
  MAX_CODE_LINES: 300,
  MAX_PROBLEM_CHARS: 4000,
  MAX_CONTEXT_CHARS: 1500,
  MAX_BODY_SIZE_BYTES: 64 * 1024, // 64 KB
  MAX_ANALYSIS_OUTPUT_TOKENS: 4096,
  MAX_HINT_OUTPUT_TOKENS: 800,
  DEFAULT_DAILY_ANALYSIS_LIMIT: 10,
  DEFAULT_DAILY_HINT_LIMIT: 30,
  DEFAULT_GLOBAL_DAILY_CAP: 300,
  IN_FLIGHT_LOCK_MS: 90 * 1000, // 90 seconds
};

export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
};
