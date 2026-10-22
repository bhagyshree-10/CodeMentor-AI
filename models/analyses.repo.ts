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

// In-memory fallback map for isolated unit test environments when MongoDB driver is not connected
const inMemoryAnalyses = new Map<string, AnalysisDocument>();

export class AnalysesRepository {
  private static async getCollection() {
    try {
      const db = await getDb();
      return db.collection<AnalysisDocument>('analyses');
    } catch (err) {
      if (process.env.NODE_ENV === 'test') {
        return null;
      }
      throw err;
    }
  }

  static async create(doc: Omit<AnalysisDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<AnalysisDocument> {
    const id = new ObjectId().toString();
    const now = new Date();
    const fullDoc: AnalysisDocument = {
      _id: id,
      ...doc,
      createdAt: now,
      updatedAt: now,
    };

    if (process.env.NODE_ENV === 'test') {
      try {
        const col = await this.getCollection();
        if (col) {
          await col.insertOne(fullDoc as any);
          return fullDoc;
        }
      } catch {
        // Fall back to in-memory in test
      }
      inMemoryAnalyses.set(id, fullDoc);
      return fullDoc;
    }

    const col = await this.getCollection();
    if (!col) {
      throw new Error('Database connection unavailable');
    }
    await col.insertOne(fullDoc as any);
    return fullDoc;
  }

  static async findCached(
    userId: string,
    codeHash: string,
    intent: AnalysisIntent,
    language: SupportedLanguage,
    promptVersion: string
  ): Promise<AnalysisDocument | null> {
    if (process.env.NODE_ENV === 'test') {
      try {
        const col = await this.getCollection();
        if (col) {
          const found = await col.findOne({
            userId,
            kind: 'analysis',
            codeHash,
            intent,
            language,
            'meta.promptVersion': promptVersion,
          });
          if (found) return found;
        }
      } catch {
        // Fallback in test
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

    try {
      const col = await this.getCollection();
      if (!col) return null;
      return await col.findOne({
        userId,
        kind: 'analysis',
        codeHash,
        intent,
        language,
        'meta.promptVersion': promptVersion,
      });
    } catch {
      return null;
    }
  }

  static async getById(id: string, userId: string): Promise<AnalysisDocument | null> {
    if (process.env.NODE_ENV === 'test') {
      try {
        const col = await this.getCollection();
        if (col) {
          const found = await col.findOne({ _id: id as any, userId });
          if (found) return found;
        }
      } catch {
        // Fallback in test
      }
      const item = inMemoryAnalyses.get(id);
      if (item && item.userId === userId) {
        return item;
      }
      return null;
    }

    const col = await this.getCollection();
    if (!col) {
      throw new Error('Database connection unavailable');
    }
    return await col.findOne({ _id: id as any, userId });
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

    if (process.env.NODE_ENV === 'test') {
      try {
        const col = await this.getCollection();
        if (col) {
          const query: any = { userId };
          if (options.kind) query.kind = options.kind;
          if (options.language) query.language = options.language;
          if (options.tag) query.mistakeTags = options.tag;
          if (options.cursor) {
            const [createdStr] = Buffer.from(options.cursor, 'base64').toString('utf8').split('|');
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
        }
      } catch {
        // Fallback in test
      }

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

    const col = await this.getCollection();
    if (!col) {
      throw new Error('Database connection unavailable');
    }

    const query: any = { userId };
    if (options.kind) query.kind = options.kind;
    if (options.language) query.language = options.language;
    if (options.tag) query.mistakeTags = options.tag;
    if (options.cursor) {
      const [createdStr] = Buffer.from(options.cursor, 'base64').toString('utf8').split('|');
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
  }

  static async deleteById(id: string, userId: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') {
      try {
        const col = await this.getCollection();
        if (col) {
          const res = await col.deleteOne({ _id: id as any, userId });
          if (res.deletedCount > 0) return true;
        }
      } catch {
        // Fallback in test
      }
      const item = inMemoryAnalyses.get(id);
      if (item && item.userId === userId) {
        inMemoryAnalyses.delete(id);
        return true;
      }
      return false;
    }

    const col = await this.getCollection();
    if (!col) {
      throw new Error('Database connection unavailable');
    }
    const res = await col.deleteOne({ _id: id as any, userId });
    return res.deletedCount > 0;
  }

  static async updateHintSession(id: string, userId: string, sessionState: HintSessionState): Promise<boolean> {
    const now = new Date();
    if (process.env.NODE_ENV === 'test') {
      try {
        const col = await this.getCollection();
        if (col) {
          const res = await col.updateOne(
            { _id: id as any, userId, kind: 'hint' },
            { $set: { hintSession: sessionState, updatedAt: now } }
          );
          if (res.modifiedCount > 0) return true;
        }
      } catch {
        // Fallback in test
      }
      const item = inMemoryAnalyses.get(id);
      if (item && item.userId === userId && item.kind === 'hint') {
        item.hintSession = sessionState;
        item.updatedAt = now;
        return true;
      }
      return false;
    }

    const col = await this.getCollection();
    if (!col) {
      throw new Error('Database connection unavailable');
    }
    const res = await col.updateOne(
      { _id: id as any, userId, kind: 'hint' },
      { $set: { hintSession: sessionState, updatedAt: now } }
    );
    return res.modifiedCount > 0;
  }

  static async countUserTagOccurrences(userId: string, tag: string): Promise<number> {
    if (process.env.NODE_ENV === 'test') {
      try {
        const col = await this.getCollection();
        if (col) {
          return await col.countDocuments({ userId, mistakeTags: tag });
        }
      } catch {
        // Fallback in test
      }
      let count = 0;
      for (const item of inMemoryAnalyses.values()) {
        if (item.userId === userId && item.mistakeTags.includes(tag)) {
          count++;
        }
      }
      return count;
    }

    try {
      const col = await this.getCollection();
      if (!col) return 0;
      return await col.countDocuments({ userId, mistakeTags: tag });
    } catch {
      return 0;
    }
  }

  static async getTopMistakeTags(userId: string, limit = 5): Promise<Array<{ tag: string; count: number }>> {
    if (process.env.NODE_ENV === 'test') {
      try {
        const col = await this.getCollection();
        if (col) {
          const pipeline = [
            { $match: { userId, kind: 'analysis' } },
            { $unwind: '$mistakeTags' },
            { $group: { _id: '$mistakeTags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit },
          ];
          const res = await col.aggregate(pipeline).toArray();
          return res.map((r) => ({ tag: r._id as string, count: r.count as number }));
        }
      } catch {
        // Fallback in test
      }
      const tagCounts = new Map<string, number>();
      for (const item of inMemoryAnalyses.values()) {
        if (item.userId === userId && item.kind === 'analysis') {
          for (const t of item.mistakeTags) {
            tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
          }
        }
      }
      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }

    const col = await this.getCollection();
    if (!col) return [];
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
      return [];
    }
  }

  static async deleteAllByUser(userId: string): Promise<number> {
    if (process.env.NODE_ENV === 'test') {
      let count = 0;
      for (const [id, item] of inMemoryAnalyses.entries()) {
        if (item.userId === userId) {
          inMemoryAnalyses.delete(id);
          count++;
        }
      }
      return count;
    }

    const col = await this.getCollection();
    if (!col) {
      throw new Error('Database connection unavailable');
    }
    const res = await col.deleteMany({ userId });
    return res.deletedCount;
  }
}
