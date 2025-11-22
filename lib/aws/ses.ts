/**
 * AWS SES client for sending emails
 * Handles magic link emails and campaign emails
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { config } from '../config';

// En Lambda/Amplify SSR, AWS SDK v3 detecta automáticamente las credenciales
// del rol de ejecución usando la cadena de proveedores predeterminada
// No especificamos credenciales explícitamente para permitir la detección automática
const sesClient = new SESClient({
  region: config.aws.region,
});

/**
 * Send magic link email
 */
export async function sendMagicLinkEmail(
  email: string,
  magicLink: string
): Promise<void> {
  const command = new SendEmailCommand({
    Source: config.ses.fromEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Tu enlace de acceso a PrecoTracks CRM',
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: `PrecoTracks CRM - Enlace de Acceso

¡Hola!

Has solicitado acceso a PrecoTracks CRM. 

Haz clic en el siguiente enlace para iniciar sesión:
${magicLink}

IMPORTANTE:
- Este enlace expira en 30 minutos
- Si no solicitaste este acceso, ignora este email de forma segura

Este es un email automático, por favor no respondas directamente.

© ${new Date().getFullYear()} PrecoTracks. Todos los derechos reservados.`,
          Charset: 'UTF-8',
        },
        Html: {
          Data: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; background-color: #ffffff; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">PrecoTracks CRM</h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px; font-weight: 400;">Tu enlace de acceso seguro</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600; line-height: 1.3;">¡Hola!</h2>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Has solicitado acceso a PrecoTracks CRM. Haz clic en el botón siguiente para iniciar sesión de forma segura.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3); transition: all 0.3s ease;">
                      Acceder al CRM
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 10px 0 0 0; word-break: break-all;">
                <a href="${magicLink}" style="color: #2563eb; text-decoration: none; font-size: 14px; font-family: 'Courier New', monospace;">${magicLink}</a>
              </p>
            </td>
          </tr>
          
          <!-- Info Box -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 6px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding-right: 12px; vertical-align: top;">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#f59e0b" stroke-width="2" fill="none"/>
                        <path d="M10 6V10M10 14H10.01" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </td>
                    <td>
                      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Importante</p>
                      <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.5;">
                        Este enlace expira en <strong>30 minutos</strong> por seguridad. Si no solicitaste este acceso, puedes ignorar este email de forma segura.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Este es un email automático, por favor no respondas directamente.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} PrecoTracks. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  });

  await sesClient.send(command);
}

/**
 * Send campaign email to a single recipient
 */
export async function sendCampaignEmail(
  toEmail: string,
  subject: string,
  bodyHtml: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const command = new SendEmailCommand({
      Source: config.ses.fromEmail,
      ReplyToAddresses: [config.ses.replyTo],
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: bodyHtml,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await sesClient.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Throttle function to avoid hitting SES rate limits
 * Simple delay between sends
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


