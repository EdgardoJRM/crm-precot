/**
 * API Route: POST /api/sequences/[id]/start
 * Start a sequence for selected participants
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  getSequenceById,
  startSequenceForParticipants,
  updateSequence,
} from '@/lib/services/sequences';
import {
  getAllParticipants,
  getParticipantsByTags,
  getParticipantsByIds,
} from '@/lib/services/participants';
import type { CampaignFilters } from '@/lib/models/types';

export async function POST(
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

    // Activate sequence if it's draft
    if (sequence.status === 'draft') {
      await updateSequence(id, { status: 'active' });
    }

    const body = await request.json();
    const filters = body.filters as CampaignFilters | undefined;

    // Resolve participant IDs based on filters
    let participantIds: string[] = [];

    if (filters?.allParticipants) {
      const all = await getAllParticipants();
      participantIds = all.map((p) => p.id);
    } else if (filters?.participantIds && filters.participantIds.length > 0) {
      participantIds = filters.participantIds;
    } else if (filters?.tags && filters.tags.length > 0) {
      const tagged = await getParticipantsByTags(filters.tags);
      participantIds = tagged.map((p) => p.id);
    }

    if (participantIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay participantes seleccionados' },
        { status: 400 }
      );
    }

    // Start sequence for participants
    await startSequenceForParticipants(id, participantIds);

    return NextResponse.json({
      success: true,
      data: {
        sequenceId: id,
        participantsAdded: participantIds.length,
      },
    });
  } catch (error: any) {
    console.error('Error starting sequence:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al iniciar secuencia' },
      { status: 500 }
    );
 500
  }
}

