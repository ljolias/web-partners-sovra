/**
 * SovraID API Types
 * Based on: https://github.com/sovrahq/id-docs
 */

// ============================================
// Credential Types
// ============================================

export interface CredentialSubject {
  /** Subject identifier (DID or URN) */
  id?: string;
  /** Holder's full name */
  name?: string;
  /** Holder's role/job title */
  jobTitle?: string;
  /** Organization the holder works for */
  worksFor?: {
    name: string;
    [key: string]: unknown;
  };
  /** Additional custom claims */
  [key: string]: unknown;
}

export interface OutputDescriptorStyles {
  thumbnail: { uri: string; alt: string };
  hero: { uri: string; alt: string };
  background: { color: string };
  text: { color: string };
}

export interface OutputDescriptorDisplay {
  title: { text: string };
  subtitle: { text: string };
  description: { text: string };
  properties: Array<{
    path: string[];
    fallback: string;
    label: string;
    schema: { type: string };
  }>;
}

export interface OutputDescriptor {
  /** Unique ID for this output descriptor */
  id: string;
  /** Schema URL for the credential */
  schema: string;
  /** Styling configuration */
  styles: OutputDescriptorStyles;
  /** Display configuration */
  display: OutputDescriptorDisplay;
}

export interface CredentialData {
  /** JSON-LD context for credential properties */
  '@context': (string | Record<string, unknown>)[];
  /** Credential types (must include "VerifiableCredential") */
  type: string[];
  /** Expiration date in YYYY-MM-DD format */
  expirationDate: string;
  /** Subject data (holder information) */
  credentialSubject: CredentialSubject | Record<string, unknown>;
}

export interface IssueCredentialRequest {
  /** Credential data structure */
  credential: CredentialData;
  /** Visual rendering configuration */
  outputDescriptor: OutputDescriptor;
}

export interface IssueCredentialResponse {
  /** Unique credential ID from SovraID */
  id: string;
  /** Wallet invitation data */
  invitation_wallet: {
    /** Invitation ID */
    invitationId: string;
    /** DIDComm invitation URL for wallet scanning */
    invitationContent: string;
  };
  /** The issued credential data */
  credential: {
    id: string;
    issuer: {
      id: string;
      name: string;
    };
    issuanceDate: string;
    credentialStatus: {
      id: string;
      type: string;
    };
    [key: string]: unknown;
  };
  /** Output descriptor used */
  outputDescriptor: OutputDescriptor;
}

export type CredentialStatusType = 'active' | 'revoked' | 'suspended';

export interface CredentialStatusResponse {
  /** Credential ID */
  id: string;
  /** Current status */
  status: CredentialStatusType;
  /** Status reason (if revoked or suspended) */
  reason?: string;
  /** Holder DID (if claimed) */
  holderDid?: string;
  /** When the credential was claimed */
  claimedAt?: string;
  /** When the status was last changed */
  statusChangedAt?: string;
}

export interface UpdateCredentialStatusRequest {
  /** New status */
  status: 'revoked' | 'suspended';
  /** Reason for the status change */
  reason: string;
}

// ============================================
// Verification Types
// ============================================

export interface InputDescriptor {
  /** Unique ID for this input */
  id: string;
  /** Human-readable name */
  name: string;
  /** Purpose of requesting this credential */
  purpose: string;
  /** Constraints for credential validation */
  constraints: {
    fields: Array<{
      path: string[];
      filter?: {
        type: string;
        pattern?: string;
        const?: string;
      };
    }>;
  };
}

export interface CreateVerificationRequest {
  /** Input descriptors defining required credentials */
  inputDescriptors: InputDescriptor[];
  /** Verification expiration in minutes */
  expiresInMinutes?: number;
  /** Callback URL for verification result */
  callbackUrl?: string;
}

export interface CreateVerificationResponse {
  /** Unique verification ID */
  id: string;
  /** DIDComm presentation URL for wallet */
  presentationUrl: string;
  /** QR code for mobile wallet scanning */
  qrCode?: string;
  /** Verification status */
  status: 'pending' | 'completed' | 'expired' | 'failed';
  /** Expiration timestamp */
  expiresAt: string;
  /** Creation timestamp */
  createdAt: string;
}

export interface VerificationResultResponse {
  /** Verification ID */
  id: string;
  /** Verification status */
  status: 'pending' | 'completed' | 'expired' | 'failed';
  /** Presented credentials (if completed) */
  presentedCredentials?: Array<{
    credentialId: string;
    issuerDid: string;
    claims: Record<string, unknown>;
  }>;
  /** Holder DID (if completed) */
  holderDid?: string;
  /** Completion timestamp */
  completedAt?: string;
}

// ============================================
// Workspace Types
// ============================================

export interface WorkspaceStatus {
  /** Workspace ID */
  id: string;
  /** Workspace DID */
  did: string;
  /** Workspace name */
  name: string;
  /** Webhook configuration */
  webhook?: {
    url: string;
    events: string[];
    active: boolean;
  };
  /** API key status */
  apiKeyActive: boolean;
}

// ============================================
// Webhook Types
// ============================================

export type WebhookEventType =
  | 'credential.issued'
  | 'credential.claimed'
  | 'credential.revoked'
  | 'credential.suspended'
  | 'verification.completed'
  | 'verification.failed';

export interface WebhookPayload {
  /** Event type */
  event: WebhookEventType;
  /** Event timestamp */
  timestamp: string;
  /** Event data */
  data: {
    /** Resource ID (credential or verification) */
    id: string;
    /** Workspace ID */
    workspaceId: string;
    /** Additional event-specific data */
    [key: string]: unknown;
  };
}

// ============================================
// Error Types
// ============================================

export interface SovraIdError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional details */
  details?: Record<string, unknown>;
}

// ============================================
// Client Configuration
// ============================================

export interface SovraIdClientConfig {
  /** API base URL */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Workspace ID */
  workspaceId: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}
