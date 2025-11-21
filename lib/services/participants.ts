/**
 * Participants service
 * Handles CRUD operations for participants
 */

import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient } from '../aws/dynamodb';
import { config } from '../config';
import type { Participant, PaginatedResponse, PaginationCursor } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const PARTICIPANTS_TABLE = config.dynamodb.participantsTable;

/**
 * Create or update a participant
 */
export async function upsertParticipant(
  participant: Omit<Participant, 'pk' | 'sk' | 'createdAt' | 'updatedAt'>
): Promise<Participant> {
  const now = new Date().toISOString();
  const existing = await getParticipantById(participant.id);

  const participantDoc: Participant = {
    pk: `PARTICIPANT#${participant.id}`,
    sk: 'META',
    ...participant,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: PARTICIPANTS_TABLE,
      Item: participantDoc,
    })
  );

  return participantDoc;
}

/**
 * Get participant by ID
 */
export async function getParticipantById(id: string): Promise<Participant | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: PARTICIPANTS_TABLE,
      Key: {
        pk: `PARTICIPANT#${id}`,
        sk: 'META',
      },
    })
  );

  return (result.Item as Participant) || null;
}

/**
 * Get participant by email
 */
export async function getParticipantByEmail(
  email: string
): Promise<Participant | null> {
  // Since email is not a key, we need to scan (or use GSI in production)
  const result = await docClient.send(
    new ScanCommand({
      TableName: PARTICIPANTS_TABLE,
      FilterExpression: 'email = :email AND sk = :sk',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase().trim(),
        ':sk': 'META',
      },
      Limit: 1,
    })
  );

  return (result.Items?.[0] as Participant) || null;
}

/**
 * List participants with filters and pagination
 */
export async function listParticipants(
  options: {
    search?: string;
    tag?: string;
    limit?: number;
    cursor?: string;
  } = {}
): Promise<PaginatedResponse<Participant>> {
  const limit = options.limit || 25;
  let lastKey: Record<string, any> | undefined;

  // Decode cursor if provided
  if (options.cursor) {
    try {
      lastKey = JSON.parse(Buffer.from(options.cursor, 'base64').toString());
    } catch {
      // Invalid cursor, ignore
    }
  }

  // Build filter expression
  const filterExpressions: string[] = ['sk = :sk'];
  const expressionValues: Record<string, any> = {
    ':sk': 'META',
  };

  if (options.search) {
    const searchLower = options.search.toLowerCase().trim();
    // Search in multiple fields: email, firstName, lastName, city, phone
    // Note: DynamoDB contains() is case-sensitive, so we search both original and lowercase versions
    // For better results, we'll do a scan and filter in memory for search
    filterExpressions.push(
      '(contains(email, :search) OR contains(firstName, :search) OR contains(lastName, :search) OR contains(city, :search) OR contains(phone, :search))'
    );
    expressionValues[':search'] = searchLower;
  }

  if (options.tag) {
    filterExpressions.push('contains(tags, :tag)');
    expressionValues[':tag'] = options.tag;
  }

  const scanParams: any = {
    TableName: PARTICIPANTS_TABLE,
    FilterExpression: filterExpressions.join(' AND '),
    ExpressionAttributeValues: expressionValues,
    Limit: limit + 1, // Get one extra to check if there's more
  };

  if (lastKey) {
    scanParams.ExclusiveStartKey = lastKey;
  }

  const result = await docClient.send(new ScanCommand(scanParams));

  let items = (result.Items || []) as Participant[];
  
  // If search is provided, do additional filtering for tags and case-insensitive matching
  if (options.search) {
    const searchLower = options.search.toLowerCase().trim();
    items = items.filter((participant) => {
      // Check all searchable fields case-insensitively
      const emailMatch = participant.email?.toLowerCase().includes(searchLower);
      const firstNameMatch = participant.firstName?.toLowerCase().includes(searchLower);
      const lastNameMatch = participant.lastName?.toLowerCase().includes(searchLower);
      const fullNameMatch = `${participant.firstName} ${participant.lastName}`.toLowerCase().includes(searchLower);
      const cityMatch = participant.city?.toLowerCase().includes(searchLower);
      const phoneMatch = participant.phone?.toLowerCase().includes(searchLower);
      
      // Check tags (case-insensitive)
      const tagMatch = participant.tags?.some(tag => 
        tag.toLowerCase().includes(searchLower)
      );
      
      return emailMatch || firstNameMatch || lastNameMatch || fullNameMatch || cityMatch || phoneMatch || tagMatch;
    });
  }

  const hasMore = items.length > limit;
  const participants = hasMore ? items.slice(0, limit) : items;

  // Create next cursor if there's more
  let nextCursor: string | undefined;
  if (hasMore && result.LastEvaluatedKey) {
    nextCursor = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
  }

  return {
    items: participants,
    nextCursor,
    hasMore: !!nextCursor,
  };
}

/**
 * Get participants by IDs
 */
export async function getParticipantsByIds(
  ids: string[]
): Promise<Participant[]> {
  // Batch get would be better, but for simplicity we'll do individual gets
  const participants: Participant[] = [];

  for (const id of ids) {
    const participant = await getParticipantById(id);
    if (participant) {
      participants.push(participant);
    }
  }

  return participants;
}

/**
 * Get participants by tags
 */
export async function getParticipantsByTags(
  tags: string[]
): Promise<Participant[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: PARTICIPANTS_TABLE,
      FilterExpression: 'sk = :sk',
      ExpressionAttributeValues: {
        ':sk': 'META',
      },
    })
  );

  const allParticipants = (result.Items || []) as Participant[];

  // Filter by tags (participant must have at least one of the tags)
  return allParticipants.filter((p) =>
    tags.some((tag) => p.tags.includes(tag))
  );
}

/**
 * Get all participants (for campaigns)
 */
export async function getAllParticipants(): Promise<Participant[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: PARTICIPANTS_TABLE,
      FilterExpression: 'sk = :sk',
      ExpressionAttributeValues: {
        ':sk': 'META',
      },
    })
  );

  return (result.Items || []) as Participant[];
}


