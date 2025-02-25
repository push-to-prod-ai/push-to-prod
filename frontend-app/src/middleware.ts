import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Check if the user is authenticated
  if (!token) {
    // If the user is not authenticated and trying to access a protected route
    // Redirect to the sign-in page
    const signInUrl = new URL('/auth/signin', request.url);
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
    // Exclude auth-related routes
    '/((?!auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 