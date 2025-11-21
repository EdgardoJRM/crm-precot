/**
 * User service for CRM users management
 * Handles user whitelist and magic link sessions
 */

import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../aws/dynamodb';
import { config } from '../config';
import type { CRMUser, MagicLinkSession } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const USERS_TABLE = config.dynamodb.usersTable;

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<CRMUser | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        pk: `USER#${email.toLowerCase()}`,
        sk: 'META',
      },
    })
  );

  return (result.Item as CRMUser) || null;
}

/**
 * Create magic link session
 */
export async function createMagicLinkSession(
  email: string
): Promise<{ token: string; expiresAt: string }> {
  const token = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.magicLink.expirationMinutes * 60 * 1000);

  const session: MagicLinkSession = {
    pk: `MAGIC#${token}`,
    sk: 'SESSION',
    email: email.toLowerCase(),
    token,
    expiresAt: expiresAt.toISOString(),
    used: false,
    createdAt: now.toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: session,
    })
  );

  return { token, expiresAt: expiresAt.toISOString() };
}

/**
 * Get and validate magic link session
 */
export async function getMagicLinkSession(
  token: string
): Promise<MagicLinkSession | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        pk: `MAGIC#${token}`,
        sk: 'SESSION',
      },
    })
  );

  return (result.Item as MagicLinkSession) || null;
}

/**
 * Mark magic link as used
 */
export async function markMagicLinkAsUsed(token: string): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        pk: `MAGIC#${token}`,
        sk: 'SESSION',
      },
      UpdateExpression: 'SET #used = :used',
      ExpressionAttributeNames: {
        '#used': 'used',
      },
      ExpressionAttributeValues: {
        ':used': true,
      },
    })
  );
}

/**
 * Validate magic link token
 */
export async function validateMagicLink(token: string): Promise<{
  valid: boolean;
  email?: string;
  error?: string;
}> {
  const session = await getMagicLinkSession(token);

  if (!session) {
    return { valid: false, error: 'Token no encontrado' };
  }

  if (session.used) {
    return { valid: false, error: 'Token ya utilizado' };
  }

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);

  if (expiresAt < now) {
    return { valid: false, error: 'Token expirado' };
  }

  return { valid: true, email: session.email };
}


