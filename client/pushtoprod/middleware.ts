import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the token using the next-auth JWT helper
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Check if the user is authenticated
  if (!token) {
    // If the user is not authenticated and trying to access a protected route
    // Redirect to the login page
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // User is authenticated, allow the request to proceed
  return NextResponse.next();
}

// Configure which routes to protect with the middleware
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/settings',
    '/settings/:path*',
    '/api/settings/:path*',
    
    // Other protected routes (more specific than the catch-all pattern)
    '/profile',
    '/dashboard',
    '/workspace',
  ],
}; 