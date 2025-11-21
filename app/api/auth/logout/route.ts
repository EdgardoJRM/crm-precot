/**
 * API Route: POST /api/auth/logout
 * Logs out user by deleting session cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    await deleteSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}


