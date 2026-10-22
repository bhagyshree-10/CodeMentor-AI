import { describe, it, expect, vi } from 'vitest';
import { AnalysesRepository } from '../../models/analyses.repo';
import * as dbModule from '../../lib/db';

describe('AnalysesRepository & Persistence Integrity', () => {
  const testUserId = 'test_user_repo_123';

  it('creates and retrieves analysis document in test mode', async () => {
    const created = await AnalysesRepository.create({
      userId: testUserId,
      kind: 'analysis',
      title: 'Two Sum Test',
      language: 'python',
      codeLineCount: 10,
      mistakeTags: ['INDEX_OUT_OF_BOUNDS', 'OFF_BY_ONE'],
      meta: {
        model: 'gemini-3.8-flash',
        promptVersion: 'v1',
        schemaVersion: 1,
        aiCalls: 1,
        repaired: false,
      },
    });

    expect(created._id).toBeDefined();
    expect(created.title).toBe('Two Sum Test');

    const found = await AnalysesRepository.getById(created._id.toString(), testUserId);
    expect(found).not.toBeNull();
    expect(found?.title).toBe('Two Sum Test');
  });

  it('lists analyses by user with filtering and pagination', async () => {
    const list = await AnalysesRepository.listByUser(testUserId, { limit: 10 });
    expect(list.items.length).toBeGreaterThanOrEqual(1);
    expect(list.items[0].userId).toBe(testUserId);
  });

  it('deletes analysis by id and user', async () => {
    const created = await AnalysesRepository.create({
      userId: testUserId,
      kind: 'analysis',
      title: 'To Be Deleted',
      language: 'javascript',
      codeLineCount: 5,
      mistakeTags: ['SYNTAX_ERROR'],
      meta: {
        model: 'gemini-3.8-flash',
        promptVersion: 'v1',
        schemaVersion: 1,
        aiCalls: 1,
        repaired: false,
      },
    });

    const deleted = await AnalysesRepository.deleteById(created._id.toString(), testUserId);
    expect(deleted).toBe(true);

    const check = await AnalysesRepository.getById(created._id.toString(), testUserId);
    expect(check).toBeNull();
  });

  it('throws in production mode if database is unavailable instead of silent fallback', async () => {
    const originalEnv = process.env.NODE_ENV;
    const spy = vi.spyOn(dbModule, 'getDb').mockRejectedValue(new Error('Connection failed'));
    try {
      (process.env as any).NODE_ENV = 'production';
      // Attempting to create when DB connection fails in production must throw
      await expect(
        AnalysesRepository.create({
          userId: 'prod_user',
          kind: 'analysis',
          title: 'Prod Test',
          language: 'python',
          codeLineCount: 1,
          mistakeTags: [],
          meta: {
            model: 'gemini-3.8-flash',
            promptVersion: 'v1',
            schemaVersion: 1,
            aiCalls: 1,
            repaired: false,
          },
        })
      ).rejects.toThrow();
    } finally {
      spy.mockRestore();
      (process.env as any).NODE_ENV = originalEnv;
    }
  });
});
