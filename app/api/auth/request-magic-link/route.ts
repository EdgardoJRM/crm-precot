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
    // Log configuration for debugging (only in production)
    if (process.env.NODE_ENV === 'production') {
      console.log('Configuration check:', {
        region: config.aws.region,
        usersTable: config.dynamodb.usersTable,
        fromEmail: config.ses.fromEmail,
        appUrl: config.app.url,
        hasSessionSecret: !!config.session.secret && config.session.secret !== 'change-me-in-production',
      });
    }

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
    let user;
    try {
      user = await getUserByEmail(normalizedEmail);
    } catch (dbError: any) {
      console.error('Error accessing DynamoDB:', dbError);
      console.error('Error details:', {
        message: dbError.message,
        name: dbError.name,
        code: dbError.code,
        region: config.aws.region,
        table: config.dynamodb.usersTable,
      });
      
      // Check if it's a permissions/credentials error
      if (dbError.name === 'UnrecognizedClientException' || 
          dbError.name === 'AccessDeniedException' ||
          dbError.code === 'CredentialsError') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Error de configuración AWS. Verifica permisos IAM y credenciales.' 
          },
          { status: 500 }
        );
      }
      
      throw dbError; // Re-throw to be caught by outer catch
    }

    if (!user || !user.isActive) {
      // Log for debugging (only in production)
      if (process.env.NODE_ENV === 'production') {
        console.log('User check:', {
          userExists: !!user,
          isActive: user?.isActive,
          email: normalizedEmail,
        });
      }
      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json(
        { success: true }, // Return success even if user doesn't exist
        { status: 200 }
      );
    }

    // Create magic link session
    let token: string;
    let expiresAt: string;
    try {
      const sessionData = await createMagicLinkSession(normalizedEmail);
      token = sessionData.token;
      expiresAt = sessionData.expiresAt;
      console.log('Magic link session created:', {
        email: normalizedEmail,
        token: token.substring(0, 8) + '...',
        expiresAt,
      });
    } catch (dbError: any) {
      console.error('Error creating magic link session:', dbError);
      throw dbError;
    }

    // Build magic link URL
    // Use explicit URL from config, fallback to request headers if needed
    let appUrl = config.app.url;
    if (!appUrl || appUrl.includes('localhost')) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      if (origin) {
        appUrl = origin;
      } else if (host) {
        appUrl = `https://${host}`;
      } else {
        appUrl = 'https://main.d2iig4dsutc1x0.amplifyapp.com'; // Fallback hardcoded para producción
      }
    }
    const magicLink = `${appUrl}/auth/verify?token=${token}`;
    console.log('Sending magic link email:', {
      to: normalizedEmail,
      from: config.ses.fromEmail,
      appUrl: appUrl,
      configUrl: config.app.url,
      link: magicLink.substring(0, 60) + '...',
    });

    // Send email via SES
    try {
      await sendMagicLinkEmail(normalizedEmail, magicLink);
      console.log('Magic link email sent successfully:', {
        to: normalizedEmail,
        from: config.ses.fromEmail,
      });
    } catch (emailError: any) {
      console.error('Error sending magic link email:', emailError);
      console.error('SES Error details:', {
        message: emailError.message,
        name: emailError.name,
        code: emailError.code,
        fromEmail: config.ses.fromEmail,
        toEmail: normalizedEmail,
      });
      
      // Still return success to not reveal if email was sent
      // But log the error for debugging
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in request-magic-link:', error);
    console.error('Full error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    
    // Return more detailed error in development, generic in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // In production, log full error details but return generic message
    // Check CloudWatch logs for full error details
    const errorMessage = error.message || 'Error interno del servidor';
    const errorName = error.name || 'Unknown';
    
    console.error('=== ERROR DETAILS ===');
    console.error('Error name:', errorName);
    console.error('Error message:', errorMessage);
    console.error('Error code:', error.code);
    console.error('Config at error:', {
      region: config.aws.region,
      usersTable: config.dynamodb.usersTable,
      fromEmail: config.ses.fromEmail,
    });
    console.error('===================');
    
    return NextResponse.json(
      { 
        success: false, 
        error: isDevelopment 
          ? `Error: ${errorMessage} (${errorName})` 
          : 'Error interno del servidor. Verifica la configuración de AWS. Revisa CloudWatch Logs para más detalles.' 
      },
      { status: 500 }
    );
  }
}


