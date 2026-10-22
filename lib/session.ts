import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { AppError } from './errors';
import { getAuthInstance } from './auth';

export interface UserSession {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    provider: string;
    storeCode: boolean;
  };
}

export async function getSession(req?: NextRequest): Promise<UserSession | null> {
  try {
    let reqHeaders: Headers;
    if (req) {
      reqHeaders = req.headers;
    } else {
      reqHeaders = headers();
    }

    const auth = await getAuthInstance();
    const sessionData = await auth.api.getSession({ headers: reqHeaders });

    if (sessionData && sessionData.user) {
      const u = sessionData.user;
      return {
        userId: u.id,
        user: {
          id: u.id,
          name: u.name || 'Learner',
          email: u.email,
          image: u.image || '',
          provider: (u as any).provider || 'email',
          storeCode: (u as any).storeCode ?? true,
        },
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function requireUser(req?: NextRequest): Promise<UserSession> {
  const session = await getSession(req);
  if (!session) {
    throw new AppError('UNAUTHENTICATED');
  }
  return session;
}
