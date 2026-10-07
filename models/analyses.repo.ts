import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db';
import { AnalysisResult } from '../schemas/analysis';
import { HintSessionState } from '../schemas/hint';
import { SupportedLanguage, AnalysisIntent } from '../lib/constants';

export interface AnalysisDocument {
  _id: ObjectId | string;
  userId: string;
  kind: 'analysis' | 'hint';
  title: string;
  language: SupportedLanguage;
  intent?: AnalysisIntent;
  code?: string;
  codeHash?: string;
  codeLineCount: number;
  result?: AnalysisResult;
  mistakeTags: string[];
  hintSession?: HintSessionState;
  meta: {
    model: string;
    promptVersion: string;
    schemaVersion: number;
    aiCalls: number;
    repaired: boolean;
    tokensIn?: number;
    tokensOut?: number;
    latencyMs?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback map for test/mock environments when MongoDB driver is not connected
const inMemoryAnalyses = new Map<string, AnalysisDocument>();

export class AnalysesRepository {
  private static async getCollection() {
    try {
      const db = await getDb();
      return db.collection<AnalysisDocument>('analyses');
    } catch {
      return null;
    }
  }

  static async create(doc: Omit<AnalysisDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<AnalysisDocument> {
    const col = await this.getCollection();
    const id = new ObjectId().toString();
    const now = new Date();
    const fullDoc: AnalysisDocument = {
      _id: id,
      ...doc,
      createdAt: now,
      updatedAt: now,
    };

    if (col) {
      try {
        await col.insertOne(fullDoc as any);
        return fullDoc;
      } catch {
        // Fallback to in-memory
      }
    }
    inMemoryAnalyses.set(id, fullDoc);
    return fullDoc;
  }

  static async findCached(
    userId: string,
    codeHash: string,
    intent: AnalysisIntent,
    language: SupportedLanguage,
    promptVersion: string
  ): Promise<AnalysisDocument | null> {
    const col = await this.getCollection();
    if (col) {
      try {
        const found = await col.findOne({
          userId,
          kind: 'analysis',
          codeHash,
          intent,
          language,
          'meta.promptVersion': promptVersion,
        });
        if (found) return found;
      } catch {
        // Fallback
      }
    }

    for (const item of inMemoryAnalyses.values()) {
      if (
        item.userId === userId &&
        item.kind === 'analysis' &&
        item.codeHash === codeHash &&
        item.intent === intent &&
        item.language === language &&
        item.meta.promptVersion === promptVersion
      ) {
        return item;
      }
    }
    return null;
  }

  static async getById(id: string, userId: string): Promise<AnalysisDocument | null> {
    const col = await this.getCollection();
    if (col) {
      try {
        const found = await col.findOne({ _id: id as any, userId });
        if (found) return found;
      } catch {
        // Fallback
      }
    }

    const item = inMemoryAnalyses.get(id);
    if (item && item.userId === userId) {
      return item;
    }
    return null;
  }

  static async listByUser(
    userId: string,
    options: {
      cursor?: string;
      limit?: number;
      kind?: 'analysis' | 'hint';
      language?: SupportedLanguage;
      tag?: string;
    }
  ) {
    const limit = Math.min(options.limit || 20, 50);
    const col = await this.getCollection();

    if (col) {
      try {
        const query: any = { userId };
        if (options.kind) query.kind = options.kind;
        if (options.language) query.language = options.language;
        if (options.tag) query.mistakeTags = options.tag;
        if (options.cursor) {
          const [createdStr, idStr] = Buffer.from(options.cursor, 'base64').toString('utf8').split('|');
          if (createdStr) {
            query.createdAt = { $lt: new Date(createdStr) };
          }
        }

        const items = await col.find(query).sort({ createdAt: -1 }).limit(limit + 1).toArray();
        let nextCursor: string | null = null;
        if (items.length > limit) {
          const nextItem = items.pop()!;
          nextCursor = Buffer.from(`${nextItem.createdAt.toISOString()}|${nextItem._id}`).toString('base64');
        }
        return { items, nextCursor };
      } catch {
        // Fallback
      }
    }

    // In-memory filter fallback
    let items = Array.from(inMemoryAnalyses.values()).filter((item) => {
      if (item.userId !== userId) return false;
      if (options.kind && item.kind !== options.kind) return false;
      if (options.language && item.language !== options.language) return false;
      if (options.tag && !item.mistakeTags.includes(options.tag)) return false;
      return true;
    });

    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    let nextCursor: string | null = null;
    if (items.length > limit) {
      items = items.slice(0, limit);
      const last = items[items.length - 1];
      nextCursor = Buffer.from(`${last.createdAt.toISOString()}|${last._id}`).toString('base64');
    }
    return { items, nextCursor };
  }

  static async deleteById(id: string, userId: string): Promise<boolean> {
    const col = await this.getCollection();
    if (col) {
      try {
        const res = await col.deleteOne({ _id: id as any, userId });
        if (res.deletedCount > 0) return true;
      } catch {
        // Fallback
      }
    }
    const item = inMemoryAnalyses.get(id);
    if (item && item.userId === userId) {
      inMemoryAnalyses.delete(id);
      return true;
    }
    return false;
  }

  static async updateHintSession(id: string, userId: string, sessionState: HintSessionState): Promise<boolean> {
    const col = await this.getCollection();
    const now = new Date();
    if (col) {
      try {
        const res = await col.updateOne(
          { _id: id as any, userId, kind: 'hint' },
          { $set: { hintSession: sessionState, updatedAt: now } }
        );
        if (res.modifiedCount > 0) return true;
      } catch {
        // Fallback
      }
    }
    const item = inMemoryAnalyses.get(id);
    if (item && item.userId === userId && item.kind === 'hint') {
      item.hintSession = sessionState;
      item.updatedAt = now;
      return true;
    }
    return false;
  }

  static async countUserTagOccurrences(userId: string, tag: string): Promise<number> {
    const col = await this.getCollection();
    if (col) {
      try {
        return await col.countDocuments({ userId, mistakeTags: tag });
      } catch {
        // Fallback
      }
    }
    let count = 0;
    for (const item of inMemoryAnalyses.values()) {
      if (item.userId === userId && item.mistakeTags.includes(tag)) {
        count++;
      }
    }
    return count;
  }

  static async getTopMistakeTags(userId: string, limit = 5): Promise<Array<{ tag: string; count: number }>> {
    const col = await this.getCollection();
    if (col) {
      try {
        const pipeline = [
          { $match: { userId, kind: 'analysis' } },
          { $unwind: '$mistakeTags' },
          { $group: { _id: '$mistakeTags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit },
        ];
        const res = await col.aggregate(pipeline).toArray();
        return res.map((r) => ({ tag: r._id as string, count: r.count as number }));
      } catch {
        // Fallback
      }
    }

    const tagCounts = new Map<string, number>();
    for (const item of inMemoryAnalyses.values()) {
      if (item.userId === userId && item.kind === 'analysis') {
        for (const t of item.mistakeTags) {
          tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
        }
      }
    }
    const sorted = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    return sorted;
  }

  static async deleteAllByUser(userId: string): Promise<number> {
    const col = await this.getCollection();
    let count = 0;
    if (col) {
      try {
        const res = await col.deleteMany({ userId });
        count += res.deletedCount;
      } catch {
        // Fallback
      }
    }
    for (const [id, item] of inMemoryAnalyses.entries()) {
      if (item.userId === userId) {
        inMemoryAnalyses.delete(id);
        count++;
      }
    }
    return count;
  }
}
