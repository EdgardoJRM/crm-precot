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
import { config } from '@/lib/config';

/**
 * Get the correct app URL for redirects
 * Never uses localhost in production
 */
function getAppUrl(request: NextRequest): string {
  // Priority: 1. NEXT_PUBLIC_APP_URL env var, 2. config.app.url, 3. request headers, 4. fallback
  let appUrl = process.env.NEXT_PUBLIC_APP_URL || config.app.url;
  
  // Never use localhost in production
  if (!appUrl || appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      appUrl = origin;
    } else if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      appUrl = `https://${host}`;
    } else {
      // Production fallback
      appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crm.precotracks.org';
    }
  }
  
  // Ensure URL doesn't have trailing slash
  return appUrl.replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    // Get correct app URL for redirects
    const appUrl = getAppUrl(request);

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', appUrl));
    }

    // Validate magic link
    const validation = await validateMagicLink(token);

    if (!validation.valid || !validation.email) {
      return NextResponse.redirect(
        new URL(`/login?error=${validation.error || 'invalid_token'}`, appUrl)
      );
    }

    // Get user
    const user = await getUserByEmail(validation.email);

    if (!user || !user.isActive) {
      return NextResponse.redirect(
        new URL('/login?error=user_not_found', appUrl)
      );
    }

    // Mark magic link as used
    await markMagicLinkAsUsed(token);

    // Create session
    const sessionToken = await createSession(user);

    // Set session cookie
    await setSessionCookie(sessionToken);

    // Redirect to dashboard using correct URL
    return NextResponse.redirect(new URL('/dashboard', appUrl));
  } catch (error: any) {
    console.error('Error in verify:', error);
    const appUrl = getAppUrl(request);
    return NextResponse.redirect(
      new URL('/login?error=server_error', appUrl)
    );
  }
}


