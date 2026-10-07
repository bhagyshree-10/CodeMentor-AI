import { FeedbackRepository } from '../models/feedback.repo';
import { AnalysesRepository } from '../models/analyses.repo';
import { AppError } from '../lib/errors';
import { env } from '../lib/env';
import { FeedbackRequest } from '../schemas/api';

export class FeedbackService {
  static async submitFeedback(userId: string, req: FeedbackRequest) {
    const analysis = await AnalysesRepository.getById(req.analysisId, userId);
    if (!analysis) {
      throw new AppError('NOT_FOUND', 'Analysis not found');
    }

    await FeedbackRepository.submit({
      userId,
      analysisId: req.analysisId,
      kind: req.kind,
      note: req.note,
      promptVersion: analysis.meta.promptVersion || 'analysis.v1',
      model: analysis.meta.model || env.GEMINI_MODEL,
    });

    return { ok: true };
  }
}
