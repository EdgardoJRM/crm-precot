/**
 * DynamoDB client configuration and helper functions
 * Uses AWS SDK v3 for DynamoDB operations
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from '../config';

// Create DynamoDB client
// Si no especificas región, AWS SDK la detecta automáticamente
// Pero la especificamos explícitamente para asegurar consistencia
const client = new DynamoDBClient({
  region: config.aws.region,
});

// Create Document Client for easier operations
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

/**
 * Helper function to create DynamoDB key
 */
export function createKey(pk: string, sk: string) {
  return { pk, sk };
}

/**
 * Helper function to batch write items (handles 25 item limit)
 */
export async function batchWrite(
  tableName: string,
  items: Record<string, any>[]
): Promise<void> {
  const BATCH_SIZE = 25;
  
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    
    // Note: In a real implementation, you'd use BatchWriteCommand
    // For now, we'll write items individually in the service layer
    // This is a placeholder for the batch write logic
  }
}


