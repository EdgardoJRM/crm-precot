/**
 * API Route: GET /api/participants
 * Lists participants with filters and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listParticipants } from '@/lib/services/participants';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const cursor = searchParams.get('cursor') || undefined;

    const result = await listParticipants({
      search,
      tag,
      limit,
      cursor,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error listing participants:', error);
    return NextResponse.json(
      { success: false, error: 'Error al listar participantes' },
      { status: 500 }
    );
  }
}


