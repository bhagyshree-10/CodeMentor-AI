import { NextRequest } from 'next/server';
import { withApi, jsonResponse } from '../../../lib/api-handler';
import { requireUser } from '../../../lib/session';
import { HintRequestSchema } from '../../../schemas/api';
import { HintService } from '../../../services/hint-service';
import { AppError } from '../../../lib/errors';

export const maxDuration = 120;

export const POST = withApi(async (req: NextRequest) => {
  const session = await requireUser(req);
  const body = await req.json().catch(() => {
    throw new AppError('VALIDATION_ERROR', 'Malformed JSON payload');
  });

  const parsed = HintRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AppError('VALIDATION_ERROR', `${issue.path.join('.')}: ${issue.message}`);
  }

  const result = await HintService.handleHintRequest(session.userId, parsed.data);
  return jsonResponse(result);
});
