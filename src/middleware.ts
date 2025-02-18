import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/admin/login', '/customer/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Get the session cookie
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return redirectToLogin(request);
  }

  // For admin routes, check the admin claim in the session cookie
  if (pathname.startsWith('/admin')) {
    try {
      const claims = JSON.parse(atob(sessionCookie.split('.')[1]));
      if (!claims.admin) {
        return redirectToLogin(request);
      }
    } catch (error) {
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = request.nextUrl.pathname.startsWith('/admin')
    ? '/admin/login'
    : '/customer/login';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
}; 