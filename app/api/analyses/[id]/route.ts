import { NextRequest } from 'next/server';
import { withApi, jsonResponse } from '../../../../lib/api-handler';
import { requireUser } from '../../../../lib/session';
import { AnalysesRepository } from '../../../../models/analyses.repo';
import { FeedbackRepository } from '../../../../models/feedback.repo';
import { InsightService } from '../../../../services/insight-service';
import { AppError } from '../../../../lib/errors';

export const dynamic = 'force-dynamic';

export const GET = withApi(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const session = await requireUser(req);
  const id = params.id;

  const doc = await AnalysesRepository.getById(id, session.userId);
  if (!doc) {
    throw new AppError('NOT_FOUND', 'Analysis or hint session not found');
  }

  const insight = doc.kind === 'analysis' && doc.mistakeTags
    ? await InsightService.computeRecurrenceInsight(session.userId, doc.mistakeTags)
    : null;

  return jsonResponse({
    id: doc._id.toString(),
    userId: doc.userId,
    kind: doc.kind,
    title: doc.title,
    language: doc.language,
    intent: doc.intent,
    code: doc.code,
    codeLineCount: doc.codeLineCount,
    result: doc.result,
    mistakeTags: doc.mistakeTags,
    hintSession: doc.hintSession,
    meta: doc.meta,
    insight,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
});

export const DELETE = withApi(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const session = await requireUser(req);
  const id = params.id;

  const deleted = await AnalysesRepository.deleteById(id, session.userId);
  if (!deleted) {
    throw new AppError('NOT_FOUND', 'Analysis not found or already deleted');
  }

  // Also delete associated feedback
  await FeedbackRepository.deleteByAnalysisId(id);

  return jsonResponse({ deleted: true });
});
