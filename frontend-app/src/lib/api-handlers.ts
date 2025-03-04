import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/utils/auth';
import { Session } from 'next-auth';

export type AuthContext = {
  auth: Session;
  userId: string;
  params: Record<string, string | string[]>;
}

export type ApiHandler = (
  req: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Wrapper for API routes that require authentication
 * Handles auth checking and error handling consistently
 */
export function withAuth(handler: ApiHandler) {
  return async (req: NextRequest, { params = {} } = {}) => {
    try {
      const session = await getAuth();
      
      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (!session.user.id) {
        return NextResponse.json(
          { error: 'Invalid user session' },
          { status: 400 }
        );
      }
      
      return await handler(req, { 
        params, 
        auth: session,
        userId: session.user.id
      });
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Standard JSON error response
 */
export function apiError(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Standard JSON success response
 */
export function apiSuccess(data: any = { success: true }, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Extract and validate request body
 * Returns null if validation fails
 */
export async function validateBody<T>(
  req: NextRequest, 
  requiredFields: string[] = []
): Promise<T | null> {
  try {
    const body = await req.json() as T;
    
    // Check required fields
    for (const field of requiredFields) {
      if (!body[field as keyof T]) {
        return null;
      }
    }
    
    return body;
  } catch (error) {
    return null;
  }
} 