import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Helper to load .env.local / .env files when running outside Next.js process (e.g. tsx scripts)
function loadEnvFiles() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valParts] = trimmed.split('=');
          const k = key.trim();
          const v = valParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (k && !process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  }
}

loadEnvFiles();

const envSchema = z.object({
  MONGODB_URI: z.string().default('mongodb://localhost:27017/codementor'),
  MONGODB_DB: z.string().default('codementor'),
  BETTER_AUTH_SECRET: z.string().default('development_secret_change_me_in_production_12345'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),
  APP_ORIGIN: z.string().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().default('mock-google-client-id'),
  GOOGLE_CLIENT_SECRET: z.string().default('mock-google-client-secret'),
  GITHUB_CLIENT_ID: z.string().default('mock-github-client-id'),
  GITHUB_CLIENT_SECRET: z.string().default('mock-github-client-secret'),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  AI_ENABLED: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .default('true'),
  DAILY_ANALYSIS_LIMIT: z.coerce.number().default(10),
  DAILY_HINT_LIMIT: z.coerce.number().default(30),
  GLOBAL_DAILY_AI_CAP: z.coerce.number().default(300),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation failed:', result.error.format());
    return envSchema.parse({});
  }
  return result.data;
}

export const env = parseEnv();
