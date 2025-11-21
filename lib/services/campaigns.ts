/**
 * Campaigns service
 * Handles CRUD operations for email campaigns
 */

import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient } from '../aws/dynamodb';
import { config } from '../config';
import type {
  Campaign,
  CampaignStats,
  CampaignFilters,
} from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const CAMPAIGNS_TABLE = config.dynamodb.campaignsTable;

/**
 * Create a new campaign
 */
export async function createCampaign(
  campaign: Omit<Campaign, 'pk' | 'sk' | 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Campaign> {
  const id = uuidv4();
  const now = new Date().toISOString();

  const campaignDoc: Campaign = {
    pk: `CAMPAIGN#${id}`,
    sk: 'META',
    id,
    ...campaign,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: CAMPAIGNS_TABLE,
      Item: campaignDoc,
    })
  );

  return campaignDoc;
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: {
        pk: `CAMPAIGN#${id}`,
        sk: 'META',
      },
    })
  );

  return (result.Item as Campaign) || null;
}

/**
 * Update campaign
 */
export async function updateCampaign(
  id: string,
  updates: Partial<Omit<Campaign, 'pk' | 'sk' | 'id' | 'createdAt'>>
): Promise<Campaign> {
  const existing = await getCampaignById(id);
  if (!existing) {
    throw new Error('Campaign not found');
  }

  const updated: Campaign = {
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
 * List all campaigns
 */
export async function listCampaigns(): Promise<Campaign[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: CAMPAIGNS_TABLE,
      FilterExpression: 'sk = :sk',
      ExpressionAttributeValues: {
        ':sk': 'META',
      },
    })
  );

  return (result.Items || []) as Campaign[];
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(
  campaignId: string
): Promise<CampaignStats | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: {
        pk: `CAMPAIGN#${campaignId}`,
        sk: 'STATS',
      },
    })
  );

  return (result.Item as CampaignStats) || null;
}

/**
 * Update campaign statistics
 */
export async function updateCampaignStats(
  campaignId: string,
  stats: Partial<CampaignStats>
): Promise<CampaignStats> {
  const existing = await getCampaignStats(campaignId);

  const statsDoc: CampaignStats = {
    pk: `CAMPAIGN#${campaignId}`,
    sk: 'STATS',
    totalRecipients: stats.totalRecipients || existing?.totalRecipients || 0,
    sentCount: stats.sentCount || existing?.sentCount || 0,
    failedCount: stats.failedCount || existing?.failedCount || 0,
    lastRunAt: stats.lastRunAt || existing?.lastRunAt || new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: CAMPAIGNS_TABLE,
      Item: statsDoc,
    })
  );

  return statsDoc;
}


