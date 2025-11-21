/**
 * API Route: GET /api/participants/count
 * Returns total count of participants
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAllParticipants } from '@/lib/services/participants';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const participants = await getAllParticipants();

    return NextResponse.json({
      success: true,
      data: {
        total: participants.length,
      },
    });
  } catch (error: any) {
    console.error('Error counting participants:', error);
    return NextResponse.json(
      { success: false, error: 'Error al contar participantes' },
      { status: 500 }
    );
  }
}

