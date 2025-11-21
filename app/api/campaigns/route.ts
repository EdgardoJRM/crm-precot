/**
 * API Route: GET /api/campaigns - List campaigns
 * API Route: POST /api/campaigns - Create campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listCampaigns, createCampaign } from '@/lib/services/campaigns';
import { textToHtml } from '@/lib/utils/text-to-html';
import type { CampaignFilters } from '@/lib/models/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const campaigns = await listCampaigns();

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error: any) {
    console.error('Error listing campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Error al listar campañas' },
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
    const { name, subject, bodyText, bodyHtml, filters } = body;

    if (!name || !subject || (!bodyText && !bodyHtml)) {
      return NextResponse.json(
        { success: false, error: 'Nombre, subject y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Convert plain text to HTML if bodyText is provided, otherwise use bodyHtml (for backward compatibility)
    const htmlContent = bodyText ? textToHtml(bodyText) : bodyHtml;

    const campaign = await createCampaign({
      name,
      subject,
      bodyHtml: htmlContent,
      createdBy: session.email,
      filters: filters as CampaignFilters,
    });

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear campaña' },
      { status: 500 }
    );
  }
}


