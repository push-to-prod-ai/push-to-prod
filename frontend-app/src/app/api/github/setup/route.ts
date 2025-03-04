import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken } from '@/lib/session';

/**
 * Handler for GitHub App setup/configuration redirects
 * 
 * When a user installs or configures the GitHub App, they'll be redirected
 * to this endpoint with installation_id and setup_action parameters.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');
  
  if (!installationId || !setupAction) {
    return NextResponse.redirect(new URL('/error?reason=invalid_setup', request.url));
  }
  
  try {
    // Create a session token for this installation
    const sessionToken = await createSessionToken({ 
      installationId, 
      setupAction 
    });
    
    // Redirect to the home page with the session token
    const homeUrl = new URL('/', request.url);
    
    // Set cookie with the session token
    const response = NextResponse.redirect(homeUrl);
    response.cookies.set('app_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Error handling GitHub app setup:', error);
    return NextResponse.redirect(new URL('/error?reason=setup_failed', request.url));
  }
} 