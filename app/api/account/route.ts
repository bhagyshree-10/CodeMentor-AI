import { NextRequest } from 'next/server';
import { withApi, jsonResponse } from '../../../lib/api-handler';
import { requireUser } from '../../../lib/session';
import { AccountService } from '../../../services/account-service';
import { PatchAccountSchema } from '../../../schemas/api';
import { AppError } from '../../../lib/errors';

export const dynamic = 'force-dynamic';

export const GET = withApi(async (req: NextRequest) => {
  const session = await requireUser(req);
  const details = await AccountService.getAccountDetails(session);
  return jsonResponse(details);
});

export const PATCH = withApi(async (req: NextRequest) => {
  const session = await requireUser(req);
  const body = await req.json().catch(() => {
    throw new AppError('VALIDATION_ERROR', 'Malformed JSON payload');
  });

  const parsed = PatchAccountSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError('VALIDATION_ERROR', 'Invalid storeCode preference');
  }

  const updated = await AccountService.updateSettings(session.userId, parsed.data.storeCode);
  return jsonResponse(updated);
});

export const DELETE = withApi(async (req: NextRequest) => {
  const session = await requireUser(req);
  const body = await req.json().catch(() => ({}));

  if (body?.confirm !== 'DELETE') {
    throw new AppError('VALIDATION_ERROR', 'Confirmation string "DELETE" is required to delete account');
  }

  const result = await AccountService.deleteAccount(session.userId);
  return jsonResponse(result);
});
