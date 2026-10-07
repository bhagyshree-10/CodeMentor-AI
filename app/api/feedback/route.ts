import { NextRequest } from 'next/server';
import { withApi, jsonResponse } from '../../../lib/api-handler';
import { requireUser } from '../../../lib/session';
import { FeedbackRequestSchema } from '../../../schemas/api';
import { FeedbackService } from '../../../services/feedback-service';
import { AppError } from '../../../lib/errors';

export const POST = withApi(async (req: NextRequest) => {
  const session = await requireUser(req);
  const body = await req.json().catch(() => {
    throw new AppError('VALIDATION_ERROR', 'Malformed JSON payload');
  });

  const parsed = FeedbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AppError('VALIDATION_ERROR', `${issue.path.join('.')}: ${issue.message}`);
  }

  const result = await FeedbackService.submitFeedback(session.userId, parsed.data);
  return jsonResponse(result);
});
