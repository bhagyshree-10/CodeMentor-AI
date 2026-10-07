import { NextRequest } from 'next/server';
import { withApi, jsonResponse } from '../../../lib/api-handler';
import { requireUser } from '../../../lib/session';
import { AnalysesRepository } from '../../../models/analyses.repo';
import { SupportedLanguage } from '../../../lib/constants';

export const dynamic = 'force-dynamic';

export const GET = withApi(async (req: NextRequest) => {
  const session = await requireUser(req);
  const searchParams = req.nextUrl.searchParams;

  const cursor = searchParams.get('cursor') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;
  const kind = (searchParams.get('kind') as 'analysis' | 'hint') || undefined;
  const language = (searchParams.get('language') as SupportedLanguage) || undefined;
  const tag = searchParams.get('tag') || undefined;

  const { items, nextCursor } = await AnalysesRepository.listByUser(session.userId, {
    cursor,
    limit,
    kind,
    language,
    tag,
  });

  const formattedItems = items.map((doc) => ({
    id: doc._id.toString(),
    kind: doc.kind,
    title: doc.title,
    language: doc.language,
    mistakeTags: doc.mistakeTags,
    summary: doc.result?.summary || doc.hintSession?.problem.substring(0, 100) || '',
    createdAt: doc.createdAt,
  }));

  // Fetch topTags on initial page load (when no cursor is passed)
  let topTags = undefined;
  if (!cursor) {
    topTags = await AnalysesRepository.getTopMistakeTags(session.userId, 5);
  }

  return jsonResponse({
    items: formattedItems,
    nextCursor,
    topTags,
  });
});
