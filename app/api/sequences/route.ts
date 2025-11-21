/**
 * API Route: GET/POST /api/sequences
 * List and create email sequences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listSequences, createSequence } from '@/lib/services/sequences';
import type { EmailSequence, EmailSequenceStep, CampaignFilters } from '@/lib/models/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const sequences = await listSequences();

    return NextResponse.json({
      success: true,
      data: sequences,
    });
  } catch (error: any) {
    console.error('Error listing sequences:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al listar secuencias' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, steps, filters } = body;

    if (!name || !steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nombre y al menos un paso son requeridos' },
        { status: 400 }
      );
    }

    // Validate steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i] as EmailSequenceStep;
      if (!step.subject || !step.bodyHtml) {
        return NextResponse.json(
          { success: false, error: `Paso ${i + 1} debe tener subject y bodyHtml` },
          { status: 400 }
        );
      }
      if (step.delayDays < 0) {
        return NextResponse.json(
          { success: false, error: `Paso ${i + 1} delayDays debe ser >= 0` },
          { status: 400 }
        );
      }
      // Set stepNumber
      step.stepNumber = i + 1;
    }

    const sequence = await createSequence({
      name,
      description,
      steps: steps as EmailSequenceStep[],
      filters: filters as CampaignFilters | undefined,
      createdBy: session.email,
    });

    return NextResponse.json({
      success: true,
      data: sequence,
    });
  } catch (error: any) {
    console.error('Error creating sequence:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear secuencia' },
      { status: 500 }
    );
  }
}

