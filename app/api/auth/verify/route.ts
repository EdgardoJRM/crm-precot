/**
 * API Route: GET /api/auth/verify
 * Verifies magic link token and creates session
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validateMagicLink,
  markMagicLinkAsUsed,
  getUserByEmail,
} from '@/lib/services/users';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Validate magic link
    const validation = await validateMagicLink(token);

    if (!validation.valid || !validation.email) {
      return NextResponse.redirect(
        new URL(`/login?error=${validation.error || 'invalid_token'}`, request.url)
      );
    }

    // Get user
    const user = await getUserByEmail(validation.email);

    if (!user || !user.isActive) {
      return NextResponse.redirect(
        new URL('/login?error=user_not_found', request.url)
      );
    }

    // Mark magic link as used
    await markMagicLinkAsUsed(token);

    // Create session
    const sessionToken = await createSession(user);

    // Set session cookie
    await setSessionCookie(sessionToken);

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error: any) {
    console.error('Error in verify:', error);
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url)
    );
  }
}

