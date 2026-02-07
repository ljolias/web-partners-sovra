/**
 * DocuSign API Client
 *
 * Environment variables required:
 * - DOCUSIGN_INTEGRATION_KEY: Your DocuSign integration key (client ID)
 * - DOCUSIGN_SECRET_KEY: Your DocuSign secret key
 * - DOCUSIGN_ACCOUNT_ID: Your DocuSign account ID
 * - DOCUSIGN_BASE_URL: DocuSign REST API base URL (e.g., https://demo.docusign.net/restapi)
 * - DOCUSIGN_OAUTH_BASE_URL: DocuSign OAuth base URL (e.g., https://account-d.docusign.com)
 * - DOCUSIGN_USER_ID: The user ID for JWT auth
 * - DOCUSIGN_PRIVATE_KEY: RSA private key for JWT auth (base64 encoded)
 */

import crypto from 'crypto';
import type { DocuSignSigner } from '@/types';

import { logger } from '@/lib/logger';
// Configuration
const config = {
  integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || '',
  secretKey: process.env.DOCUSIGN_SECRET_KEY || '',
  accountId: process.env.DOCUSIGN_ACCOUNT_ID || '',
  baseUrl: process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi',
  oauthBaseUrl: process.env.DOCUSIGN_OAUTH_BASE_URL || 'https://account-d.docusign.com',
  userId: process.env.DOCUSIGN_USER_ID || '',
  privateKey: process.env.DOCUSIGN_PRIVATE_KEY || '',
  webhookSecret: process.env.DOCUSIGN_WEBHOOK_SECRET || '',
};

// Token cache
let accessToken: string | null = null;
let tokenExpiry: number = 0;

export interface EnvelopeRecipient {
  email: string;
  name: string;
  recipientId: string;
  routingOrder: string;
  role?: 'partner' | 'sovra';
}

export interface CreateEnvelopeParams {
  templateId?: string;
  emailSubject: string;
  emailBlurb?: string;
  signers: EnvelopeRecipient[];
  documentBase64?: string;
  documentName?: string;
  status?: 'created' | 'sent';
}

export interface EnvelopeStatus {
  envelopeId: string;
  status: string;
  statusDateTime: string;
  recipients: {
    signers: Array<{
      email: string;
      name: string;
      status: string;
      signedDateTime?: string;
    }>;
  };
}

/**
 * Generate JWT token for DocuSign API authentication
 */
async function generateJWTToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  const header = {
    typ: 'JWT',
    alg: 'RS256',
  };

  const payload = {
    iss: config.integrationKey,
    sub: config.userId,
    aud: config.oauthBaseUrl.replace('https://', ''),
    iat: now,
    exp: expiry,
    scope: 'signature impersonation',
  };

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const privateKey = Buffer.from(config.privateKey, 'base64').toString('utf-8');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${headerBase64}.${payloadBase64}`);
  const signature = sign.sign(privateKey, 'base64url');

  return `${headerBase64}.${payloadBase64}.${signature}`;
}

/**
 * Get access token from DocuSign OAuth
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry - 60000) {
    return accessToken;
  }

  const jwtToken = await generateJWTToken();

  const response = await fetch(`${config.oauthBaseUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DocuSign OAuth error: ${error}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return accessToken as string;
}

/**
 * Make authenticated request to DocuSign API
 */
async function docuSignRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(
    `${config.baseUrl}/v2.1/accounts/${config.accountId}${endpoint}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DocuSign API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Create and send an envelope for signing
 */
export async function createEnvelope(params: CreateEnvelopeParams): Promise<string> {
  const { templateId, emailSubject, emailBlurb, signers, documentBase64, documentName, status = 'sent' } = params;

  let envelopeDefinition: Record<string, unknown>;

  if (templateId) {
    // Create from template
    envelopeDefinition = {
      templateId,
      templateRoles: signers.map((signer) => ({
        email: signer.email,
        name: signer.name,
        roleName: signer.role === 'sovra' ? 'Sovra Representative' : 'Partner Representative',
      })),
      status,
    };
  } else if (documentBase64 && documentName) {
    // Create with document
    envelopeDefinition = {
      emailSubject,
      emailBlurb,
      documents: [
        {
          documentBase64,
          name: documentName,
          fileExtension: documentName.split('.').pop() || 'pdf',
          documentId: '1',
        },
      ],
      recipients: {
        signers: signers.map((signer, index) => ({
          email: signer.email,
          name: signer.name,
          recipientId: signer.recipientId || String(index + 1),
          routingOrder: signer.routingOrder || String(index + 1),
          tabs: {
            signHereTabs: [
              {
                documentId: '1',
                pageNumber: '1',
                xPosition: '100',
                yPosition: '700',
              },
            ],
            dateSignedTabs: [
              {
                documentId: '1',
                pageNumber: '1',
                xPosition: '100',
                yPosition: '750',
              },
            ],
          },
        })),
      },
      status,
    };
  } else {
    throw new Error('Either templateId or documentBase64/documentName must be provided');
  }

  const result = await docuSignRequest<{ envelopeId: string }>('/envelopes', {
    method: 'POST',
    body: JSON.stringify(envelopeDefinition),
  });

  return result.envelopeId;
}

/**
 * Get envelope status and recipient information
 */
export async function getEnvelopeStatus(envelopeId: string): Promise<EnvelopeStatus> {
  const envelope = await docuSignRequest<EnvelopeStatus>(
    `/envelopes/${envelopeId}?include=recipients`
  );
  return envelope;
}

/**
 * Get the signed document from an envelope
 */
export async function getSignedDocument(envelopeId: string): Promise<Buffer> {
  const token = await getAccessToken();

  const response = await fetch(
    `${config.baseUrl}/v2.1/accounts/${config.accountId}/envelopes/${envelopeId}/documents/combined`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get signed document: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get the signing certificate for an envelope
 */
export async function getSigningCertificate(envelopeId: string): Promise<Buffer> {
  const token = await getAccessToken();

  const response = await fetch(
    `${config.baseUrl}/v2.1/accounts/${config.accountId}/envelopes/${envelopeId}/documents/certificate`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get certificate: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Void an envelope
 */
export async function voidEnvelope(envelopeId: string, reason: string): Promise<void> {
  await docuSignRequest(`/envelopes/${envelopeId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'voided',
      voidedReason: reason,
    }),
  });
}

/**
 * Resend envelope to recipients who haven't signed
 */
export async function resendEnvelope(envelopeId: string): Promise<void> {
  await docuSignRequest(`/envelopes/${envelopeId}?resend_envelope=true`, {
    method: 'PUT',
    body: JSON.stringify({}),
  });
}

/**
 * Get embedded signing URL for a recipient
 */
export async function getEmbeddedSigningUrl(
  envelopeId: string,
  signerEmail: string,
  signerName: string,
  returnUrl: string
): Promise<string> {
  const result = await docuSignRequest<{ url: string }>(
    `/envelopes/${envelopeId}/views/recipient`,
    {
      method: 'POST',
      body: JSON.stringify({
        authenticationMethod: 'none',
        email: signerEmail,
        userName: signerName,
        returnUrl,
      }),
    }
  );

  return result.url;
}

/**
 * List available templates
 */
export async function listTemplates(): Promise<
  Array<{ templateId: string; name: string; description: string }>
> {
  const result = await docuSignRequest<{
    envelopeTemplates: Array<{
      templateId: string;
      name: string;
      description: string;
    }>;
  }>('/templates');

  return result.envelopeTemplates || [];
}

/**
 * Convert DocuSign envelope status to our internal signer status
 */
export function mapEnvelopeStatusToSigners(envelope: EnvelopeStatus): DocuSignSigner[] {
  return envelope.recipients.signers.map((signer) => ({
    email: signer.email,
    name: signer.name,
    role: signer.email.includes('@sovra') ? 'sovra' : 'partner',
    status: mapDocuSignStatus(signer.status),
    signedAt: signer.signedDateTime,
  }));
}

function mapDocuSignStatus(
  status: string
): 'pending' | 'sent' | 'delivered' | 'signed' | 'declined' {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'signed':
      return 'signed';
    case 'declined':
      return 'declined';
    case 'delivered':
      return 'delivered';
    case 'sent':
      return 'sent';
    default:
      return 'pending';
  }
}

/**
 * Check if DocuSign is configured
 */
export function isDocuSignConfigured(): boolean {
  return Boolean(
    config.integrationKey &&
    config.accountId &&
    config.baseUrl &&
    config.userId &&
    config.privateKey
  );
}

/**
 * Verify webhook HMAC signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!config.webhookSecret) {
    logger.warn('DocuSign webhook secret not configured');
    return false;
  }

  const hmac = crypto.createHmac('sha256', config.webhookSecret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
