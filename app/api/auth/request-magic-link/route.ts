/**
 * API Route: POST /api/auth/request-magic-link
 * Handles magic link request - validates user and sends email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createMagicLinkSession } from '@/lib/services/users';
import { sendMagicLinkEmail } from '@/lib/aws/ses';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists and is active
    const user = await getUserByEmail(normalizedEmail);

    if (!user || !user.isActive) {
      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json(
        { success: true }, // Return success even if user doesn't exist
        { status: 200 }
      );
    }

    // Create magic link session
    const { token, expiresAt } = await createMagicLinkSession(normalizedEmail);

    // Build magic link URL
    const magicLink = `${config.app.url}/auth/verify?token=${token}`;

    // Send email via SES
    try {
      await sendMagicLinkEmail(normalizedEmail, magicLink);
    } catch (emailError) {
      console.error('Error sending magic link email:', emailError);
      // Still return success to not reveal if email was sent
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in request-magic-link:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


