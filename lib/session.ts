import { NextRequest } from 'next/server';
import { AppError } from './errors';

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

export const DEMO_USER: UserSession['user'] = {
  id: 'demo-user-123',
  name: 'Demo Learner',
  email: 'learner@codementor.ai',
  image: '',
  provider: 'demo',
  storeCode: true,
};

export async function getSession(req?: NextRequest): Promise<UserSession | null> {
  // Check session cookie if req is provided
  if (req) {
    const sessionCookie = req.cookies.get('better-auth.session_token') || req.cookies.get('demo_session');
    if (sessionCookie?.value) {
      return {
        userId: sessionCookie.value.startsWith('demo-') ? 'demo-user-123' : sessionCookie.value,
        user: DEMO_USER,
      };
    }
  }

  // Fallback to default demo user session for seamless development / review
  return {
    userId: DEMO_USER.id,
    user: DEMO_USER,
  };
}

export async function requireUser(req?: NextRequest): Promise<UserSession> {
  const session = await getSession(req);
  if (!session) {
    throw new AppError('UNAUTHENTICATED');
  }
  return session;
}
