import { getDb } from '../lib/db';
import { env } from '../lib/env';

export interface UsageDocument {
  _id: string; // u:<userId>:<YYYY-MM-DD> or g:<YYYY-MM-DD>
  userId?: string;
  day: string; // YYYY-MM-DD
  analyses: number;
  hints: number;
  inFlightUntil?: Date | null;
  expiresAt: Date;
}

const inMemoryUsage = new Map<string, UsageDocument>();

export class UsageRepository {
  private static getTodayUTCString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private static getExpiresAt(): Date {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 2); // 2 days TTL
    return d;
  }

  private static async getCollection() {
    try {
      const db = await getDb();
      return db.collection<UsageDocument>('usage');
    } catch {
      return null;
    }
  }

  static async reserveQuota(
    userId: string,
    kind: 'analyses' | 'hints',
    userLimit: number,
    lockMs = 90000
  ): Promise<{ success: boolean; reason?: 'QUOTA_EXCEEDED' | 'REQUEST_IN_PROGRESS' }> {
    const today = this.getTodayUTCString();
    const userDocId = `u:${userId}:${today}`;
    const globalDocId = `g:${today}`;
    const now = new Date();
    const lockExpiry = new Date(now.getTime() + lockMs);
    const expiresAt = this.getExpiresAt();

    const col = await this.getCollection();

    if (col) {
      try {
        // 1. Check Global Cap
        const globalDoc = await col.findOne({ _id: globalDocId });
        const globalTotal = (globalDoc?.analyses || 0) + (globalDoc?.hints || 0);
        if (globalTotal >= env.GLOBAL_DAILY_AI_CAP) {
          return { success: false, reason: 'QUOTA_EXCEEDED' };
        }

        // 2. Ensure user doc exists
        await col.updateOne(
          { _id: userDocId },
          {
            $setOnInsert: {
              userId,
              day: today,
              analyses: 0,
              hints: 0,
              inFlightUntil: null,
              expiresAt,
            },
          },
          { upsert: true }
        );

        // 3. Atomic user quota reservation + in-flight lock
        const filter = {
          _id: userDocId,
          [kind]: { $lt: userLimit },
          $or: [{ inFlightUntil: null }, { inFlightUntil: { $lt: now } }],
        };

        const update = {
          $inc: { [kind]: 1 },
          $set: { inFlightUntil: lockExpiry },
        };

        const res = await col.findOneAndUpdate(filter, update, { returnDocument: 'after' });
        if (res) {
          // Also increment global doc
          await col.updateOne(
            { _id: globalDocId },
            { $inc: { [kind]: 1 }, $setOnInsert: { day: today, expiresAt } },
            { upsert: true }
          );
          return { success: true };
        }

        // If reservation failed, diagnose whether in-flight or quota exceeded
        const existing = await col.findOne({ _id: userDocId });
        if (existing) {
          if (existing.inFlightUntil && existing.inFlightUntil > now) {
            return { success: false, reason: 'REQUEST_IN_PROGRESS' };
          }
          if (existing[kind] >= userLimit) {
            return { success: false, reason: 'QUOTA_EXCEEDED' };
          }
        }
        return { success: false, reason: 'QUOTA_EXCEEDED' };
      } catch {
        // Fallback
      }
    }

    // In-memory fallback logic
    let uDoc = inMemoryUsage.get(userDocId);
    if (!uDoc) {
      uDoc = { _id: userDocId, userId, day: today, analyses: 0, hints: 0, expiresAt, inFlightUntil: null };
      inMemoryUsage.set(userDocId, uDoc);
    }

    if (uDoc.inFlightUntil && uDoc.inFlightUntil > now) {
      return { success: false, reason: 'REQUEST_IN_PROGRESS' };
    }

    if (uDoc[kind] >= userLimit) {
      return { success: false, reason: 'QUOTA_EXCEEDED' };
    }

    uDoc[kind] += 1;
    uDoc.inFlightUntil = lockExpiry;
    return { success: true };
  }

  static async releaseLock(userId: string, kind: 'analyses' | 'hints', refund = false): Promise<void> {
    const today = this.getTodayUTCString();
    const userDocId = `u:${userId}:${today}`;
    const globalDocId = `g:${today}`;

    const col = await this.getCollection();
    if (col) {
      try {
        const update: any = { $set: { inFlightUntil: null } };
        if (refund) {
          update.$inc = { [kind]: -1 };
        }
        await col.updateOne({ _id: userDocId }, update);
        if (refund) {
          await col.updateOne({ _id: globalDocId }, { $inc: { [kind]: -1 } });
        }
        return;
      } catch {
        // Fallback
      }
    }

    const uDoc = inMemoryUsage.get(userDocId);
    if (uDoc) {
      uDoc.inFlightUntil = null;
      if (refund && uDoc[kind] > 0) {
        uDoc[kind] -= 1;
      }
    }
  }

  static async getUsage(userId: string): Promise<{ analysesUsed: number; hintsUsed: number }> {
    const today = this.getTodayUTCString();
    const userDocId = `u:${userId}:${today}`;

    const col = await this.getCollection();
    if (col) {
      try {
        const doc = await col.findOne({ _id: userDocId });
        return {
          analysesUsed: doc?.analyses || 0,
          hintsUsed: doc?.hints || 0,
        };
      } catch {
        // Fallback
      }
    }

    const uDoc = inMemoryUsage.get(userDocId);
    return {
      analysesUsed: uDoc?.analyses || 0,
      hintsUsed: uDoc?.hints || 0,
    };
  }
}
