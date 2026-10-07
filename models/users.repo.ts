import { getDb } from '../lib/db';
import { AnalysesRepository } from './analyses.repo';
import { FeedbackRepository } from './feedback.repo';

export interface UserDocument {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  storeCode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inMemoryUserSettings = new Map<string, { storeCode: boolean }>();

export class UsersRepository {
  private static async getCollection() {
    try {
      const db = await getDb();
      return db.collection('users');
    } catch {
      return null;
    }
  }

  static async getStoreCodeSetting(userId: string): Promise<boolean> {
    const col = await this.getCollection();
    if (col) {
      try {
        const user = await col.findOne({ _id: userId as any });
        if (user && typeof user.storeCode === 'boolean') {
          return user.storeCode;
        }
      } catch {
        // Fallback
      }
    }
    const local = inMemoryUserSettings.get(userId);
    return local ? local.storeCode : true; // Default true
  }

  static async updateStoreCode(userId: string, storeCode: boolean): Promise<void> {
    const col = await this.getCollection();
    if (col) {
      try {
        await col.updateOne({ _id: userId as any }, { $set: { storeCode, updatedAt: new Date() } });
      } catch {
        // Fallback
      }
    }
    inMemoryUserSettings.set(userId, { storeCode });
  }

  static async deleteAccountCascade(userId: string): Promise<void> {
    const db = await getDb().catch(() => null);

    // 1. Delete analyses & feedback
    await AnalysesRepository.deleteAllByUser(userId);
    await FeedbackRepository.deleteAllByUser(userId);

    // 2. Cascade delete in MongoDB collections
    if (db) {
      try {
        await db.collection('users').deleteOne({ _id: userId as any });
        await db.collection('session').deleteMany({ userId: userId as any });
        await db.collection('account').deleteMany({ userId: userId as any });
        await db.collection('usage').deleteMany({ userId });
      } catch {
        // Fallback
      }
    }
    inMemoryUserSettings.delete(userId);
  }
}
