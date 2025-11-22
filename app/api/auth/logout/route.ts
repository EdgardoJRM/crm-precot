/**
 * API Route: POST /api/auth/logout
 * Logs out user by deleting session cookie and redirects to login
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    await deleteSessionCookie();

    // Redirect to login page instead of returning JSON
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  } catch (error: any) {
    console.error('Error in logout:', error);
    // Even on error, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}


