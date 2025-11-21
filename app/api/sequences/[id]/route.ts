/**
 * API Route: GET/PUT /api/sequences/[id]
 * Get and update email sequences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSequenceById, updateSequence } from '@/lib/services/sequences';

export async function GET(
  request: NextRequest,
  { params }: Readonly<{ params: Promise<{ id: string }> }>
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const sequence = await getSequenceById(id);

    if (!sequence) {
      return NextResponse.json(
        { success: false, error: 'Secuencia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sequence,
    });
  } catch (error: any) {
    console.error('Error getting sequence:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener secuencia' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Readonly<{ params: Promise<{ id: string }> }>
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const sequence = await updateSequence(id, body);

    return NextResponse.json({
      success: true,
      data: sequence,
    });
  } catch (error: any) {
    console.error('Error updating sequence:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar secuencia' },
      { status: 500 }
    );
  }
}

