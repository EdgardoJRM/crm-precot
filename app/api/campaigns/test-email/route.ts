/**
 * API Route: POST /api/campaigns/test-email
 * Sends a test email with campaign content
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { sendCampaignEmail } from '@/lib/aws/ses';
import { replaceTags, getSampleReplacements } from '@/lib/utils/email-tags';

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
    const { email, subject, bodyHtml } = body;

    if (!email || !subject || !bodyHtml) {
      return NextResponse.json(
        { success: false, error: 'Email, subject y bodyHtml son requeridos' },
        { status: 400 }
      );
    }

    // Replace tags with sample data
    const sampleData = getSampleReplacements();
    const processedSubject = replaceTags(subject, sampleData);
    const processedBodyHtml = replaceTags(bodyHtml, sampleData);

    // Send test email
    const result = await sendCampaignEmail(email, processedSubject, processedBodyHtml);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de prueba enviado exitosamente',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Error al enviar email' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

