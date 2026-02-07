import { logger } from '@/lib/logger';
/**
 * SovraID API Client
 *
 * Client for interacting with the SovraID verifiable credentials API.
 * Documentation: https://github.com/sovrahq/id-docs
 */

import type {
  SovraIdClientConfig,
  IssueCredentialRequest,
  IssueCredentialResponse,
  CredentialStatusResponse,
  UpdateCredentialStatusRequest,
  CreateVerificationRequest,
  CreateVerificationResponse,
  VerificationResultResponse,
  WorkspaceStatus,
  SovraIdError,
  CredentialData,
  OutputDescriptor,
} from './types';

// W3C Credentials context
const W3C_CREDENTIALS_CONTEXT = 'https://www.w3.org/2018/credentials/v1';

/**
 * SovraID API Client
 */
export class SovraIdClient {
  private baseUrl: string;
  private apiKey: string;
  private workspaceId: string;
  private timeout: number;

  constructor(config: SovraIdClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.workspaceId = config.workspaceId;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new SovraIdApiError(
          error.message || `API request failed with status ${response.status}`,
          error.code || `HTTP_${response.status}`,
          error.details
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof SovraIdApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new SovraIdApiError('Request timeout', 'TIMEOUT');
      }

      throw new SovraIdApiError(
        error instanceof Error ? error.message : 'Unknown error',
        'NETWORK_ERROR'
      );
    }
  }

  // ============================================
  // Workspace Operations
  // ============================================

  /**
   * Get workspace status and configuration
   */
  async getWorkspaceStatus(): Promise<WorkspaceStatus> {
    return this.request<WorkspaceStatus>('GET', '/workspaces/status');
  }

  /**
   * Configure webhook for the workspace
   * Note: This endpoint may not be available in all SovraID versions
   */
  async configureWebhook(params: {
    url: string;
    events: string[];
    secret?: string;
  }): Promise<{ success: boolean; webhook?: { url: string; events: string[]; active: boolean } }> {
    try {
      const result = await this.request<{ url: string; events: string[]; active: boolean }>(
        'PUT',
        `/workspaces/${this.workspaceId}/webhook`,
        {
          url: params.url,
          events: params.events,
          secret: params.secret,
        }
      );
      return { success: true, webhook: result };
    } catch (error) {
      // If the endpoint doesn't exist, the webhook must be configured via dashboard
      logger.warn('[SovraID] Webhook configuration via API not available:', { error });
      throw error;
    }
  }

  // ============================================
  // Credential Operations
  // ============================================

  /**
   * Issue a new verifiable credential
   *
   * Based on SovraID API documentation:
   * https://github.com/sovrahq/id-docs/blob/main/docs/guides/api-sovra-id.md
   */
  async issueCredential(params: {
    partnerName: string;
    partnerLogo?: string;
    holderName: string;
    holderEmail: string;
    role: string;
    expirationDate?: string;
  }): Promise<IssueCredentialResponse> {
    // Calculate expiration date (1 year from now if not provided)
    const expirationDate = params.expirationDate || (() => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date.toISOString().split('T')[0];
    })();

    // Define custom properties in the context with @id and @type
    // as per SovraID documentation
    const customContext = {
      holderName: {
        '@id': 'https://sovra.io/vocab#holderName',
        '@type': 'xsd:string',
      },
      partnerName: {
        '@id': 'https://sovra.io/vocab#partnerName',
        '@type': 'xsd:string',
      },
      role: {
        '@id': 'https://sovra.io/vocab#role',
        '@type': 'xsd:string',
      },
      email: {
        '@id': 'https://sovra.io/vocab#email',
        '@type': 'xsd:string',
      },
    };

    const credentialSubject = {
      holderName: params.holderName,
      partnerName: params.partnerName,
      role: params.role,
      email: params.holderEmail,
    };

    const credential: CredentialData = {
      '@context': [
        W3C_CREDENTIALS_CONTEXT,
        'https://www.w3.org/2018/credentials/examples/v1',
        customContext,
      ],
      type: ['VerifiableCredential'],
      expirationDate,
      credentialSubject,
    };

    const outputDescriptor: OutputDescriptor = {
      id: 'sovra-partner-portal-access',
      schema: 'https://sovra.io/schemas/partner-access',
      styles: {
        thumbnail: {
          uri: 'https://storage.googleapis.com/sovra-public/logo-icon.png',
          alt: 'Sovra Logo',
        },
        hero: {
          uri: 'https://storage.googleapis.com/sovra-public/credential-hero.png',
          alt: 'Partner Portal',
        },
        background: { color: '#0066FF' },
        text: { color: '#FFFFFF' },
      },
      display: {
        title: { text: 'Sovra Partner Portal' },
        subtitle: { text: params.partnerName },
        description: { text: `Credencial de acceso para ${params.holderName}` },
        properties: [
          {
            path: ['$.credentialSubject.holderName'],
            fallback: 'N/A',
            label: 'Nombre',
            schema: { type: 'string' },
          },
          {
            path: ['$.credentialSubject.role'],
            fallback: 'N/A',
            label: 'Rol',
            schema: { type: 'string' },
          },
          {
            path: ['$.credentialSubject.partnerName'],
            fallback: 'N/A',
            label: 'Partner',
            schema: { type: 'string' },
          },
        ],
      },
    };

    const request: IssueCredentialRequest = {
      credential,
      outputDescriptor,
    };

    return this.request<IssueCredentialResponse>(
      'POST',
      `/credentials/workspace/${this.workspaceId}`,
      request
    );
  }

  /**
   * Get credential details by ID
   */
  async getCredential(credentialId: string): Promise<IssueCredentialResponse> {
    return this.request<IssueCredentialResponse>(
      'GET',
      `/credentials/${credentialId}`
    );
  }

  /**
   * Get credential status (public endpoint)
   */
  async getCredentialStatus(credentialId: string): Promise<CredentialStatusResponse> {
    return this.request<CredentialStatusResponse>(
      'GET',
      `/public/credentials/status/${credentialId}`
    );
  }

  /**
   * Revoke a credential
   */
  async revokeCredential(credentialId: string, reason: string): Promise<CredentialStatusResponse> {
    const request: UpdateCredentialStatusRequest = {
      status: 'revoked',
      reason,
    };

    return this.request<CredentialStatusResponse>(
      'PUT',
      `/credentials/${credentialId}/workspace/${this.workspaceId}/status/revoked`,
      request
    );
  }

  /**
   * Suspend a credential (temporary)
   */
  async suspendCredential(credentialId: string, reason: string): Promise<CredentialStatusResponse> {
    const request: UpdateCredentialStatusRequest = {
      status: 'suspended',
      reason,
    };

    return this.request<CredentialStatusResponse>(
      'PUT',
      `/credentials/${credentialId}/workspace/${this.workspaceId}/status/suspended`,
      request
    );
  }

  /**
   * Reactivate a suspended credential
   */
  async reactivateCredential(credentialId: string): Promise<CredentialStatusResponse> {
    return this.request<CredentialStatusResponse>(
      'PUT',
      `/credentials/${credentialId}/workspace/${this.workspaceId}/status/active`,
      {}
    );
  }

  // ============================================
  // Verification Operations
  // ============================================

  /**
   * Create a verification request
   */
  async createVerification(params: {
    purpose: string;
    requiredRole?: string;
    requiredPartner?: string;
    expiresInMinutes?: number;
    callbackUrl?: string;
  }): Promise<CreateVerificationResponse> {
    const fields: Array<{ path: string[]; filter?: { type: string; const?: string } }> = [
      { path: ['$.type'] },
      { path: ['$.credentialSubject.partnerName'] },
      { path: ['$.credentialSubject.holderName'] },
      { path: ['$.credentialSubject.role'] },
    ];

    // Add role constraint if specified
    if (params.requiredRole) {
      fields.push({
        path: ['$.credentialSubject.role'],
        filter: { type: 'string', const: params.requiredRole },
      });
    }

    // Add partner constraint if specified
    if (params.requiredPartner) {
      fields.push({
        path: ['$.credentialSubject.partnerName'],
        filter: { type: 'string', const: params.requiredPartner },
      });
    }

    const request: CreateVerificationRequest = {
      inputDescriptors: [
        {
          id: 'partner-portal-access',
          name: 'Partner Portal Access Credential',
          purpose: params.purpose,
          constraints: { fields },
        },
      ],
      expiresInMinutes: params.expiresInMinutes || 15,
      callbackUrl: params.callbackUrl,
    };

    return this.request<CreateVerificationResponse>(
      'POST',
      `/verifications/workspace/${this.workspaceId}`,
      request
    );
  }

  /**
   * Get verification result
   */
  async getVerification(verificationId: string): Promise<VerificationResultResponse> {
    return this.request<VerificationResultResponse>(
      'GET',
      `/verifications/${verificationId}`
    );
  }
}

/**
 * Custom error class for SovraID API errors
 */
export class SovraIdApiError extends Error implements SovraIdError {
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'SovraIdApiError';
    this.code = code;
    this.details = details;
  }
}

// ============================================
// Singleton Instance
// ============================================

let clientInstance: SovraIdClient | null = null;

/**
 * Get the SovraID client instance
 * Uses environment variables for configuration
 */
export function getSovraIdClient(): SovraIdClient {
  if (!clientInstance) {
    const baseUrl = process.env.SOVRAID_API_URL;
    const apiKey = process.env.SOVRAID_API_KEY;
    const workspaceId = process.env.SOVRAID_WORKSPACE_ID;

    if (!baseUrl || !apiKey || !workspaceId) {
      throw new Error(
        'SovraID configuration missing. Please set SOVRAID_API_URL, SOVRAID_API_KEY, and SOVRAID_WORKSPACE_ID environment variables.'
      );
    }

    clientInstance = new SovraIdClient({
      baseUrl,
      apiKey,
      workspaceId,
    });
  }

  return clientInstance;
}

/**
 * Check if SovraID is configured
 */
export function isSovraIdConfigured(): boolean {
  return !!(
    process.env.SOVRAID_API_URL &&
    process.env.SOVRAID_API_KEY &&
    process.env.SOVRAID_WORKSPACE_ID
  );
}
