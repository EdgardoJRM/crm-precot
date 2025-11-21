/**
 * Configuration file for PrecoTracks CRM
 * Centralizes all environment variables and configuration constants
 */

export const config = {
  aws: {
    // AWS SDK detecta automáticamente la región, pero especificamos us-east-1 por defecto
    // Solo necesitas REGION si tus recursos están en otra región
    region: process.env.REGION || 'us-east-1',
  },
  dynamodb: {
    usersTable: process.env.CRM_USERS_TABLE || 'CRM-Users',
    participantsTable: process.env.CRM_PARTICIPANTS_TABLE || 'CRM-Participants',
    campaignsTable: process.env.CRM_CAMPAIGNS_TABLE || 'CRM-Campaigns',
  },
  ses: {
    fromEmail: process.env.SES_FROM_EMAIL || 'noreply@precotracks.org',
    replyTo: process.env.SES_REPLY_TO || 'noreply@precotracks.org',
  },
  app: {
    // Use NEXT_PUBLIC_APP_URL if available, otherwise try APP_URL, otherwise default
    // In production, this should be set to the Amplify app URL
    url: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    cookieName: 'crm_session',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  magicLink: {
    expirationMinutes: 30,
  },
} as const;


