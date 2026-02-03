import { NextRequest, NextResponse } from 'next/server';
import { updatePartnerCredential, addAuditLog } from '@/lib/redis';

/**
 * SovraID Webhook Handler
 *
 * Based on: https://github.com/sovrahq/id-docs/blob/main/docs/guides/webhooks.md
 *
 * Receives events from SovraID:
 * - credential-issued: Credential accepted by holder's wallet
 * - verifiable-presentation-finished: Verification completed
 */

// Payload structure from SovraID
interface SovraIdWebhookPayload {
  eventType: string;
  eventData: Record<string, unknown>;
  eventWebhookResponse?: unknown;
}

// credential-issued event data
interface CredentialIssuedData {
  vc: {
    id?: string;
    credentialSubject?: {
      email?: string;
      holderName?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  holderDID: string;
  invitationId: string;
}

// verifiable-presentation-finished event data
interface VerificationFinishedData {
  verified: boolean;
  holderDID: string;
  verifierDID: string;
  invitationId: string;
  verifiableCredentials: Array<Record<string, unknown>>;
}

export async function POST(request: NextRequest) {
  try {
    // Log incoming request for debugging
    console.log('[SovraID Webhook] Received request');

    const rawBody = await request.text();
    console.log('[SovraID Webhook] Raw body:', rawBody);

    // Parse the body
    let payload: SovraIdWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('[SovraID Webhook] Failed to parse body:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('[SovraID Webhook] Event type:', payload.eventType);
    console.log('[SovraID Webhook] Event data:', JSON.stringify(payload.eventData, null, 2));

    // Verify webhook secret if configured
    const webhookSecret = process.env.SOVRAID_WEBHOOK_SECRET;
    if (webhookSecret) {
      // Check possible header names for the secret
      const authHeader = request.headers.get('authorization');
      const signature =
        request.headers.get('x-sovraid-signature') ||
        request.headers.get('x-webhook-secret') ||
        (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader);

      console.log('[SovraID Webhook] Checking authentication...');

      if (signature !== webhookSecret) {
        console.warn('[SovraID Webhook] Signature mismatch - continuing for debugging');
        // In production, uncomment this:
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Handle events based on eventType
    switch (payload.eventType) {
      case 'credential-issued':
        await handleCredentialIssued(payload.eventData as unknown as CredentialIssuedData);
        break;

      case 'verifiable-presentation-finished':
        await handleVerificationFinished(payload.eventData as unknown as VerificationFinishedData);
        break;

      default:
        console.log('[SovraID Webhook] Unhandled event type:', payload.eventType);
    }

    // Respond within 5 seconds as recommended
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[SovraID Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle credential-issued event
 * Triggered when credential is accepted by holder's wallet
 */
async function handleCredentialIssued(eventData: CredentialIssuedData) {
  const { holderDID, invitationId, vc } = eventData;

  console.log('[SovraID Webhook] Processing credential-issued');
  console.log('[SovraID Webhook] Holder DID:', holderDID);
  console.log('[SovraID Webhook] Invitation ID:', invitationId);

  // Find the local credential by invitation ID, credential ID, or email
  const credential = await findCredentialByInvitationId(invitationId, eventData);

  if (!credential) {
    console.warn('[SovraID Webhook] Credential not found for invitation ID:', invitationId);
    return;
  }

  // Update local credential status to active
  await updatePartnerCredential(credential.id, {
    status: 'active',
    claimedAt: new Date().toISOString(),
    holderDid: holderDID,
  });

  // Add audit log
  await addAuditLog(
    'credential.claimed' as never,
    'credential',
    credential.id,
    { id: 'system', name: 'SovraID Webhook', type: 'system' as never },
    {
      entityName: credential.holderName,
      metadata: {
        invitationId,
        holderDID,
        vcId: vc?.id,
      },
    }
  );

  console.log('[SovraID Webhook] Credential activated successfully:', credential.id);
}

/**
 * Handle verifiable-presentation-finished event
 * Triggered when verification is completed
 */
async function handleVerificationFinished(eventData: VerificationFinishedData) {
  const { verified, holderDID, invitationId, verifiableCredentials } = eventData;

  console.log('[SovraID Webhook] Processing verifiable-presentation-finished');
  console.log('[SovraID Webhook] Verified:', verified);
  console.log('[SovraID Webhook] Holder DID:', holderDID);
  console.log('[SovraID Webhook] Invitation ID (presentationId):', invitationId);

  // Add audit log for the verification
  await addAuditLog(
    'verification.completed' as never,
    'verification' as never,
    invitationId,
    { id: 'system', name: 'SovraID Webhook', type: 'system' as never },
    {
      entityName: `Verification ${invitationId}`,
      metadata: {
        verified,
        holderDID,
        credentialsCount: verifiableCredentials?.length || 0,
      },
    }
  );

  console.log('[SovraID Webhook] Verification logged:', invitationId, 'verified:', verified);
}

// ============================================
// Helper Functions
// ============================================

interface CredentialRecord {
  id: string;
  partnerId: string;
  holderName: string;
  holderEmail: string;
  role: string;
  status: string;
  sovraIdCredentialId?: string;
  sovraIdInvitationId?: string;
  [key: string]: unknown;
}

/**
 * Find a credential by SovraID invitation ID, credential ID, or extract from VC
 */
async function findCredentialByInvitationId(
  invitationId: string,
  eventData?: CredentialIssuedData
): Promise<CredentialRecord | null> {
  const { redis } = await import('@/lib/redis/client');

  // Get all credentials
  const allCredentialIds = await redis.zrange('credentials:all', 0, -1);
  console.log('[SovraID Webhook] Searching through', allCredentialIds.length, 'credentials');

  // Extract email from VC if available (for fallback matching)
  const vcEmail = eventData?.vc?.credentialSubject?.email as string | undefined;
  const vcCredentialId = eventData?.vc?.id as string | undefined;
  // Extract just the UUID from the full credential URL if present
  const vcCredentialUuid = vcCredentialId?.split('/').pop();

  console.log('[SovraID Webhook] Looking for invitationId:', invitationId);
  console.log('[SovraID Webhook] VC email:', vcEmail);
  console.log('[SovraID Webhook] VC credential ID:', vcCredentialUuid);

  for (const credentialId of allCredentialIds) {
    const credential = await redis.hgetall(`credential:${credentialId}`) as CredentialRecord | null;
    if (credential && credential.id) {
      console.log('[SovraID Webhook] Checking credential:', {
        id: credential.id,
        email: credential.holderEmail,
        sovraIdCredentialId: credential.sovraIdCredentialId,
        sovraIdInvitationId: credential.sovraIdInvitationId,
      });

      // Try to match by invitation ID
      if (credential.sovraIdInvitationId === invitationId) {
        console.log('[SovraID Webhook] Found by invitationId match');
        return credential;
      }

      // Try to match by credential ID
      if (credential.sovraIdCredentialId === invitationId ||
          credential.sovraIdCredentialId === vcCredentialUuid) {
        console.log('[SovraID Webhook] Found by credentialId match');
        return credential;
      }

      // Fallback: match by email from VC
      if (vcEmail && credential.holderEmail?.toLowerCase() === vcEmail.toLowerCase()) {
        console.log('[SovraID Webhook] Found by email match (fallback)');
        return credential;
      }
    }
  }

  return null;
}
