/**
 * SovraID Integration Module
 *
 * Provides verifiable credential management through SovraID API.
 */

export { SovraIdClient, SovraIdApiError, getSovraIdClient, isSovraIdConfigured } from './client';

export type {
  // Credential types
  CredentialSubject,
  OutputDescriptor,
  IssueCredentialRequest,
  IssueCredentialResponse,
  CredentialStatusType,
  CredentialStatusResponse,
  UpdateCredentialStatusRequest,

  // Verification types
  InputDescriptor,
  CreateVerificationRequest,
  CreateVerificationResponse,
  VerificationResultResponse,

  // Workspace types
  WorkspaceStatus,

  // Webhook types
  WebhookEventType,
  WebhookPayload,

  // Error types
  SovraIdError,

  // Config types
  SovraIdClientConfig,
} from './types';
