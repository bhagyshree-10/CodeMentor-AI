import { getDb } from '../lib/db';
import { ObjectId } from 'mongodb';

export interface FeedbackDocument {
  _id?: ObjectId | string;
  userId: string;
  analysisId: string;
  kind: 'incorrect';
  note?: string;
  promptVersion: string;
  model: string;
  createdAt: Date;
}

const inMemoryFeedback = new Map<string, FeedbackDocument>();

export class FeedbackRepository {
  private static async getCollection() {
    try {
      const db = await getDb();
      return db.collection<FeedbackDocument>('feedback');
    } catch {
      return null;
    }
  }

  static async submit(doc: Omit<FeedbackDocument, 'createdAt'>): Promise<void> {
    const col = await this.getCollection();
    const now = new Date();
    const fullDoc: FeedbackDocument = { ...doc, createdAt: now };

    if (col) {
      try {
        await col.updateOne(
          { userId: doc.userId, analysisId: doc.analysisId },
          { $set: fullDoc },
          { upsert: true }
        );
        return;
      } catch {
        // Fallback
      }
    }

    const key = `${doc.userId}:${doc.analysisId}`;
    inMemoryFeedback.set(key, fullDoc);
  }

  static async deleteByAnalysisId(analysisId: string): Promise<void> {
    const col = await this.getCollection();
    if (col) {
      try {
        await col.deleteMany({ analysisId });
        return;
      } catch {
        // Fallback
      }
    }
    for (const [key, item] of inMemoryFeedback.entries()) {
      if (item.analysisId === analysisId) {
        inMemoryFeedback.delete(key);
      }
    }
  }

  static async deleteAllByUser(userId: string): Promise<void> {
    const col = await this.getCollection();
    if (col) {
      try {
        await col.deleteMany({ userId });
        return;
      } catch {
        // Fallback
      }
    }
    for (const [key, item] of inMemoryFeedback.entries()) {
      if (item.userId === userId) {
        inMemoryFeedback.delete(key);
      }
    }
  }
}
