import { runHintPipeline, runAttemptEvaluationPipeline } from './ai/hint-pipeline';
import { createInitialHintState, advanceHintLevel, addAttemptFeedback } from './ai/hint-state';
import { AnalysesRepository } from '../models/analyses.repo';
import { UsersRepository } from '../models/users.repo';
import { QuotaService } from './quota-service';
import { HintRequest } from '../schemas/api';
import { AppError } from '../lib/errors';
import { env } from '../lib/env';

export class HintService {
  static async handleHintRequest(userId: string, req: HintRequest) {
    if (req.action === 'start') {
      return this.startSession(userId, req.problem, req.language, req.attempt);
    } else if (req.action === 'next') {
      return this.nextHint(userId, req.analysisId);
    } else {
      return this.submitAttempt(userId, req.analysisId, req.attempt);
    }
  }

  private static async startSession(
    userId: string,
    problem: string,
    language?: any,
    attempt?: string
  ) {
    const sessionState = createInitialHintState(problem);
    const title = problem.split('\n')[0].substring(0, 80) || 'DSA Problem Hint';

    const doc = await AnalysesRepository.create({
      userId,
      kind: 'hint',
      title,
      language: language || 'python',
      code: attempt,
      codeLineCount: attempt ? attempt.split('\n').length : 0,
      mistakeTags: [],
      hintSession: sessionState,
      meta: {
        model: env.GEMINI_MODEL,
        promptVersion: 'hint.v1',
        schemaVersion: 1,
        aiCalls: 0,
        repaired: false,
      },
    });

    const quota = await QuotaService.getUserUsage(userId);

    return {
      analysisId: doc._id.toString(),
      currentLevel: 0,
      status: sessionState.status,
      entries: [],
      quota,
    };
  }

  private static async nextHint(userId: string, analysisId: string) {
    const sessionDoc = await AnalysesRepository.getById(analysisId, userId);
    if (!sessionDoc || sessionDoc.kind !== 'hint' || !sessionDoc.hintSession) {
      throw new AppError('NOT_FOUND', 'Hint session not found');
    }

    const currentState = sessionDoc.hintSession;
    if (currentState.currentLevel >= 4) {
      throw new AppError('HINT_LIMIT_REACHED', "You've seen all four hints. Try implementing the algorithm outline.");
    }

    await QuotaService.reserveHintQuota(userId);

    try {
      const targetLevel = (currentState.currentLevel + 1) as 1 | 2 | 3 | 4;
      const hintEntry = await runHintPipeline({
        level: targetLevel,
        problem: currentState.problem,
        previousEntries: currentState.entries,
        attempt: sessionDoc.code,
      });

      const updatedState = advanceHintLevel(currentState, hintEntry);
      await AnalysesRepository.updateHintSession(analysisId, userId, updatedState);

      await QuotaService.releaseHintLock(userId, false);
      const quota = await QuotaService.getUserUsage(userId);

      return {
        analysisId,
        currentLevel: updatedState.currentLevel,
        status: updatedState.status,
        entry: hintEntry,
        entries: updatedState.entries,
        quota,
      };
    } catch (err) {
      await QuotaService.releaseHintLock(userId, true);
      throw err;
    }
  }

  private static async submitAttempt(userId: string, analysisId: string, attempt: string) {
    if (!attempt || !attempt.trim()) {
      throw new AppError('VALIDATION_ERROR', 'Attempt text is required');
    }

    const sessionDoc = await AnalysesRepository.getById(analysisId, userId);
    if (!sessionDoc || sessionDoc.kind !== 'hint' || !sessionDoc.hintSession) {
      throw new AppError('NOT_FOUND', 'Hint session not found');
    }

    const currentState = sessionDoc.hintSession;
    await QuotaService.reserveHintQuota(userId);

    try {
      const feedbackContent = await runAttemptEvaluationPipeline({
        problem: currentState.problem,
        level: Math.max(currentState.currentLevel, 1),
        attempt: attempt.trim(),
        language: sessionDoc.language,
      });

      const feedbackEntry = {
        level: currentState.currentLevel,
        type: 'attempt-feedback' as const,
        content: feedbackContent,
        attemptText: attempt.trim(),
        createdAt: new Date(),
      };

      const updatedState = addAttemptFeedback(currentState, feedbackEntry);
      await AnalysesRepository.updateHintSession(analysisId, userId, updatedState);

      await QuotaService.releaseHintLock(userId, false);
      const quota = await QuotaService.getUserUsage(userId);

      return {
        analysisId,
        currentLevel: updatedState.currentLevel,
        status: updatedState.status,
        entry: feedbackEntry,
        quota,
      };
    } catch (err) {
      await QuotaService.releaseHintLock(userId, true);
      throw err;
    }
  }
}
