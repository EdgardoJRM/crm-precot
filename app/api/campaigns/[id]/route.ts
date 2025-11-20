/**
 * API Route: GET /api/campaigns/[id] - Get campaign
 * API Route: PUT /api/campaigns/[id] - Update campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getCampaignById, updateCampaign } from '@/lib/services/campaigns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error('Error getting campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener campaña' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const campaign = await updateCampaign(id, body);

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar campaña' },
      { status: 500 }
    );
  }
}

