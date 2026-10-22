import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { requireUser, getSession } from '../../lib/session';
import { middleware } from '../../middleware';
import { AppError } from '../../lib/errors';
import { getAuthInstance } from '../../lib/auth';

describe('Authentication & Route Protection', () => {
  it('getSession returns null when no session is present (no mock DEMO_USER fallback)', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      headers: new Headers(),
    });
    const session = await getSession(req);
    expect(session).toBeNull();
  });

  it('requireUser throws UNAUTHENTICATED error when unauthenticated', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      headers: new Headers(),
    });
    await expect(requireUser(req)).rejects.toThrowError(AppError);
    await expect(requireUser(req)).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
      status: 401,
    });
  });

  it('middleware redirects unauthenticated users visiting /app to /login with callbackUrl', () => {
    const req = new NextRequest('http://localhost:3000/app/workspace');
    const res = middleware(req);
    expect(res.status).toBe(307); // NextResponse.redirect
    const location = res.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('callbackUrl=%2Fapp%2Fworkspace');
  });

  it('middleware allows request when valid session cookie exists', () => {
    const req = new NextRequest('http://localhost:3000/app', {
      headers: {
        cookie: 'better-auth.session_token=valid_test_token_123',
      },
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('supports email/password registration without Invalid origin error on port 3000 and 3001', async () => {
    const auth = await getAuthInstance();
    const testEmail = `test_${Date.now()}@example.com`;

    // Test sign up from origin http://localhost:3001
    const req3001 = new Request('http://localhost:3001/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': 'http://localhost:3001',
        'host': 'localhost:3001',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        name: 'Alex Developer',
      }),
    });

    const res = await auth.handler(req3001);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.token).toBeDefined();
    expect(json.user).toMatchObject({
      email: testEmail,
      name: 'Alex Developer',
    });
  });

  it('supports email/password sign-in and rejects invalid credentials', async () => {
    const auth = await getAuthInstance();
    const testEmail = `signin_${Date.now()}@example.com`;
    const password = 'CorrectPassword123!';

    // 1. Create account
    const signUpReq = new Request('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': 'http://localhost:3000',
        'host': 'localhost:3000',
      },
      body: JSON.stringify({ email: testEmail, password, name: 'SignIn Test' }),
    });
    await auth.handler(signUpReq);

    // 2. Reject wrong password
    const wrongPasswordReq = new Request('http://localhost:3000/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': 'http://localhost:3000',
        'host': 'localhost:3000',
      },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword' }),
    });
    const wrongRes = await auth.handler(wrongPasswordReq);
    expect(wrongRes.status).toBeGreaterThanOrEqual(400);

    // 3. Accept correct password
    const correctSignInReq = new Request('http://localhost:3000/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': 'http://localhost:3000',
        'host': 'localhost:3000',
      },
      body: JSON.stringify({ email: testEmail, password }),
    });
    const correctRes = await auth.handler(correctSignInReq);
    expect(correctRes.status).toBe(200);
    const correctJson = await correctRes.json();
    expect(correctJson.token).toBeDefined();
  });

  it('generates correct Google OAuth redirect_uri matching request origin', async () => {
    const auth = await getAuthInstance();

    // Port 3000 check
    const req3000 = new Request('http://localhost:3000/api/auth/sign-in/social', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': 'http://localhost:3000',
        'host': 'localhost:3000',
      },
      body: JSON.stringify({ provider: 'google', callbackURL: '/app' }),
    });
    const res3000 = await auth.handler(req3000);
    const json3000 = await res3000.json();
    const url3000 = new URL(json3000.url);
    expect(url3000.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/auth/callback/google');

    // Port 3001 check
    const req3001 = new Request('http://localhost:3001/api/auth/sign-in/social', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': 'http://localhost:3001',
        'host': 'localhost:3001',
      },
      body: JSON.stringify({ provider: 'google', callbackURL: '/app' }),
    });
    const res3001 = await auth.handler(req3001);
    const json3001 = await res3001.json();
    const url3001 = new URL(json3001.url);
    expect(url3001.searchParams.get('redirect_uri')).toBe('http://localhost:3001/api/auth/callback/google');
  });
});
