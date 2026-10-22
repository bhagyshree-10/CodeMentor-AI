import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /app routes
  if (pathname.startsWith('/app')) {
    const sessionCookie =
      req.cookies.get('better-auth.session_token') ||
      req.cookies.get('__Secure-better-auth.session_token');

    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
