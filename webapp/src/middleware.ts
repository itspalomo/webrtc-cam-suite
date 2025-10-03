import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for server-side route protection
 * This runs BEFORE pages render, preventing client-side bypasses
 */

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/',
  '/settings',
  '/viewer',
];

// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = ['/login'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/privacy'];

/**
 * Check if a path matches any protected route patterns
 */
function isProtectedRoute(pathname: string): boolean {
  // Exact matches or prefix matches (for dynamic routes like /viewer/[id])
  return PROTECTED_ROUTES.some(route => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

/**
 * Check if user is authenticated by validating the session token
 */
function isAuthenticated(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('site_session')?.value;
  const sessionData = request.cookies.get('site_session_data')?.value;
  
  if (!sessionToken || !sessionData) {
    return false;
  }

  try {
    // Decode session data
    const data = JSON.parse(decodeURIComponent(sessionData));
    
    // Check if session has expired
    const now = Date.now();
    if (data.expiresAt && now > data.expiresAt) {
      return false;
    }

    // Validate token matches
    return sessionToken === 'authenticated';
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files (css, js, images, etc.)
  ) {
    return NextResponse.next();
  }

  const authenticated = isAuthenticated(request);

  // Handle public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Handle auth routes (login page)
  if (AUTH_ROUTES.includes(pathname)) {
    if (authenticated) {
      // Already logged in, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!authenticated) {
      // Not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Authenticated, allow access
    return NextResponse.next();
  }

  // Default: allow access
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
