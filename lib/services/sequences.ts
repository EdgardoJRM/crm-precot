/**
 * Email Sequences service
 * Handles CRUD operations for email sequences (drip campaigns)
 */

import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient } from '../aws/dynamodb';
import { config } from '../config';
import type {
  EmailSequence,
  EmailSequenceStep,
  ParticipantSequenceProgress,
  CampaignFilters,
} from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const CAMPAIGNS_TABLE = config.dynamodb.campaignsTable; // Reusing campaigns table

/**
 * Create a new email sequence
 */
export async function createSequence(
  sequence: Omit<EmailSequence, 'pk' | 'sk' | 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<EmailSequence> {
  const id = uuidv4();
  const now = new Date().toISOString();

  const sequenceDoc: EmailSequence = {
    pk: `SEQUENCE#${id}`,
    sk: 'META',
    id,
    ...sequence,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: CAMPAIGNS_TABLE,
      Item: sequenceDoc,
    })
  );

  return sequenceDoc;
}

/**
 * Get sequence by ID
 */
export async function getSequenceById(id: string): Promise<EmailSequence | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: {
        pk: `SEQUENCE#${id}`,
        sk: 'META',
      },
    })
  );

  return (result.Item as EmailSequence) || null;
}

/**
 * Update sequence
 */
export async function updateSequence(
  id: string,
  updates: Partial<Omit<EmailSequence, 'pk' | 'sk' | 'id' | 'createdAt'>>
): Promise<EmailSequence> {
  const existing = await getSequenceById(id);
  if (!existing) {
    throw new Error('Sequence not found');
  }

  const updated: EmailSequence = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: CAMPAIGNS_TABLE,
      Item: updated,
    })
  );

  return updated;
}

/**
 * List all sequences
 */
export async function listSequences(): Promise<EmailSequence[]> {
  // Scan all items and filter in code (DynamoDB doesn't support begins_with in FilterExpression easily)
  const result = await docClient.send(
    new ScanCommand({
      TableName: CAMPAIGNS_TABLE,
      FilterExpression: 'sk = :sk',
      ExpressionAttributeValues: {
        ':sk': 'META',
      },
    })
  );

  // Filter sequences in code
  const sequences = (result.Items || []).filter(
    (item) => item.pk?.startsWith('SEQUENCE#')
  ) as EmailSequence[];

  return sequences;
}

/**
 * Start a sequence for participants (add them to the sequence)
 */
export async function startSequenceForParticipants(
  sequenceId: string,
  participantIds: string[]
): Promise<void> {
  const sequence = await getSequenceById(sequenceId);
  if (!sequence || sequence.status !== 'active') {
    throw new Error('Sequence not found or not active');
  }

  const now = new Date();
  const firstStep = sequence.steps[0];
  if (!firstStep) {
    throw new Error('Sequence has no steps');
  }

  // Calculate next send date (immediately for first step)
  const nextSendDate = new Date(now);

  // Import getParticipantById to get email
  const { getParticipantById } = await import('./participants');

  // Create progress records for each participant
  // Note: In production, you'd want to batch these or use BatchWriteCommand
  for (const participantId of participantIds) {
    const participant = await getParticipantById(participantId);
    if (!participant) continue;

    const progress: ParticipantSequenceProgress = {
      pk: `SEQUENCE#${sequenceId}`,
      sk: `PARTICIPANT#${participantId}`,
      sequenceId,
      participantId,
      participantEmail: participant.email,
      currentStep: 1,
      nextSendDate: nextSendDate.toISOString(),
      startedAt: now.toISOString(),
      lastSentStep: 0,
    };

    await docClient.send(
      new PutCommand({
        TableName: CAMPAIGNS_TABLE,
        Item: progress,
      })
    );
  }
}

/**
 * Get participants ready to receive next email in a sequence
 */
export async function getParticipantsReadyForNextStep(
  sequenceId: string
): Promise<ParticipantSequenceProgress[]> {
  const now = new Date().toISOString();

  const result = await docClient.send(
    new QueryCommand({
      TableName: CAMPAIGNS_TABLE,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
      FilterExpression: 'nextSendDate <= :now',
      ExpressionAttributeValues: {
        ':pk': `SEQUENCE#${sequenceId}`,
        ':skPrefix': 'PARTICIPANT#',
        ':now': now,
      },
    })
  );

  return (result.Items || []) as ParticipantSequenceProgress[];
}

/**
 * Update participant progress after sending an email
 */
export async function updateParticipantProgress(
  sequenceId: string,
  participantId: string,
  stepNumber: number,
  nextSendDate: Date
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: {
        pk: `SEQUENCE#${sequenceId}`,
        sk: `PARTICIPANT#${participantId}`,
      },
      UpdateExpression: 'SET currentStep = :step, lastSentStep = :step, nextSendDate = :nextDate',
      ExpressionAttributeValues: {
        ':step': stepNumber,
        ':nextDate': nextSendDate.toISOString(),
      },
    })
  );
}

/**
 * Mark participant sequence as completed
 */
export async function completeParticipantSequence(
  sequenceId: string,
  participantId: string
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: {
        pk: `SEQUENCE#${sequenceId}`,
        sk: `PARTICIPANT#${participantId}`,
      },
      UpdateExpression: 'SET completedAt = :completed',
      ExpressionAttributeValues: {
        ':completed': new Date().toISOString(),
      },
    })
  );
}

