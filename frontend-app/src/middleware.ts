import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  // Check GitHub App installation session first
  const appSession = request.cookies.get('app_session')?.value;
  
  if (appSession) {
    const session = await verifySessionToken(appSession);
    if (session) {
      // Valid installation session
      return NextResponse.next();
    }
  }
  
  // Fall back to OAuth check
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Check if the user is authenticated
  if (!token) {
    // If the user is not authenticated and trying to access a protected route
    // Redirect to the sign-in page
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
}

// Configure which routes to protect with the middleware
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/',
    '/api/settings/:path*',
    '/api/github/:path*',
    // Exclude auth-related routes - THIS IS CRITICAL
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 