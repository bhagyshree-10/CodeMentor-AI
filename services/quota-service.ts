import { UsageRepository } from '../models/usage.repo';
import { env } from '../lib/env';
import { AppError } from '../lib/errors';
import { LIMITS } from '../lib/constants';

export class QuotaService {
  static async reserveAnalysisQuota(userId: string): Promise<void> {
    if (!env.AI_ENABLED) {
      throw new AppError('AI_DISABLED');
    }

    const limit = env.DAILY_ANALYSIS_LIMIT || LIMITS.DEFAULT_DAILY_ANALYSIS_LIMIT;
    const res = await UsageRepository.reserveQuota(userId, 'analyses', limit, LIMITS.IN_FLIGHT_LOCK_MS);

    if (!res.success) {
      if (res.reason === 'REQUEST_IN_PROGRESS') {
        throw new AppError('REQUEST_IN_PROGRESS');
      }
      throw new AppError('QUOTA_EXCEEDED');
    }
  }

  static async reserveHintQuota(userId: string): Promise<void> {
    if (!env.AI_ENABLED) {
      throw new AppError('AI_DISABLED');
    }

    const limit = env.DAILY_HINT_LIMIT || LIMITS.DEFAULT_DAILY_HINT_LIMIT;
    const res = await UsageRepository.reserveQuota(userId, 'hints', limit, LIMITS.IN_FLIGHT_LOCK_MS);

    if (!res.success) {
      if (res.reason === 'REQUEST_IN_PROGRESS') {
        throw new AppError('REQUEST_IN_PROGRESS');
      }
      throw new AppError('QUOTA_EXCEEDED');
    }
  }

  static async releaseAnalysisLock(userId: string, refund = false): Promise<void> {
    await UsageRepository.releaseLock(userId, 'analyses', refund);
  }

  static async releaseHintLock(userId: string, refund = false): Promise<void> {
    await UsageRepository.releaseLock(userId, 'hints', refund);
  }

  static async getUserUsage(userId: string) {
    const usage = await UsageRepository.getUsage(userId);
    const now = new Date();
    const resetsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    return {
      analysesUsed: usage.analysesUsed,
      analysesLimit: env.DAILY_ANALYSIS_LIMIT,
      hintsUsed: usage.hintsUsed,
      hintsLimit: env.DAILY_HINT_LIMIT,
      resetsAt: resetsAt.toISOString(),
    };
  }
}
