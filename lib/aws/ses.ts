/**
 * AWS SES client for sending emails
 * Handles magic link emails and campaign emails
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { config } from '../config';

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
          Data: `Hola,\n\nHaz clic en el siguiente enlace para acceder a PrecoTracks CRM:\n\n${magicLink}\n\nEste enlace expira en 30 minutos.\n\nSi no solicitaste este acceso, ignora este email.\n\nSaludos,\nEquipo PrecoTracks`,
          Charset: 'UTF-8',
        },
        Html: {
          Data: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Acceso a PrecoTracks CRM</h2>
                <p>Haz clic en el siguiente enlace para acceder:</p>
                <p><a href="${magicLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acceder al CRM</a></p>
                <p style="color: #666; font-size: 12px;">Este enlace expira en 30 minutos.</p>
                <p style="color: #666; font-size: 12px;">Si no solicitaste este acceso, ignora este email.</p>
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


