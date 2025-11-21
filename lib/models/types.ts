/**
 * TypeScript types and interfaces for PrecoTracks CRM
 * Defines all data models used throughout the application
 */

// User model for CRM users (whitelist)
export interface CRMUser {
  pk: string; // USER#<email>
  sk: string; // META
  email: string;
  name?: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Magic link session model
export interface MagicLinkSession {
  pk: string; // MAGIC#<token>
  sk: string; // SESSION
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

// Participant model
export interface Participant {
  pk: string; // PARTICIPANT#<id>
  sk: string; // META
  id: string; // UUID
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Campaign model
export interface Campaign {
  pk: string; // CAMPAIGN#<id>
  sk: string; // META
  id: string; // UUID
  name: string;
  subject: string;
  bodyHtml: string;
  createdBy: string; // email
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  filters?: CampaignFilters;
}

// Campaign statistics
export interface CampaignStats {
  pk: string; // CAMPAIGN#<id>
  sk: string; // STATS
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  lastRunAt?: string;
}

// Campaign filters for targeting participants
export interface CampaignFilters {
  tags?: string[];
  city?: string;
  participantIds?: string[]; // For manual selection
  allParticipants?: boolean; // Send to everyone
}

// Session payload (stored in JWT cookie)
export interface SessionPayload {
  email: string;
  name?: string;
  role: 'admin' | 'staff';
  iat: number; // issued at
  exp: number; // expiration
  [key: string]: unknown; // Allow additional properties for JWT compatibility
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// CSV Import mapping
export interface CSVColumnMapping {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  tags?: string;
}

// CSV Import result
export interface ImportResult {
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors?: string[];
}

// Pagination cursor
export interface PaginationCursor {
  limit: number;
  lastKey?: Record<string, any>;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string; // base64 encoded lastKey
  hasMore: boolean;
}


