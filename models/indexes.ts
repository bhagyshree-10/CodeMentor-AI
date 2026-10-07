import { getDb } from '../lib/db';
import { logger } from '../lib/logger';

export async function ensureIndexes(): Promise<void> {
  try {
    const db = await getDb();

    // 1. analyses indexes
    const analyses = db.collection('analyses');
    await analyses.createIndex({ userId: 1, createdAt: -1 });
    await analyses.createIndex({ userId: 1, mistakeTags: 1, createdAt: -1 });
    await analyses.createIndex(
      { userId: 1, codeHash: 1, intent: 1, language: 1, 'meta.promptVersion': 1 },
      {
        partialFilterExpression: { kind: 'analysis', codeHash: { $exists: true } },
      }
    );

    // 2. usage indexes
    const usage = db.collection('usage');
    await usage.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // 3. feedback indexes
    const feedback = db.collection('feedback');
    await feedback.createIndex({ userId: 1, analysisId: 1 }, { unique: true });
    await feedback.createIndex({ analysisId: 1 });

    logger.info('Database indexes created successfully.');
  } catch (err: any) {
    logger.warn('Index creation warning (may run in mock mode):', { error: err.message });
  }
}
