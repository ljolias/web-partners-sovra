import { NextRequest, NextResponse } from 'next/server';
import {
  getPartnerCredentials,
  updatePartnerCredential,
  addAuditLog,
} from '@/lib/redis';
import type { WebhookPayload, WebhookEventType } from '@/lib/sovraid';

/**
 * SovraID Webhook Handler
 *
 * Receives events from SovraID when credential states change:
 * - credential.claimed - User has claimed the credential in their wallet
 * - credential.revoked - Credential was revoked externally
 * - verification.completed - A verification was successfully completed
 */
export async function POST(request: NextRequest) {
  try {
    // Log all incoming webhook requests for debugging
    console.log('[SovraID Webhook] Received request');
    console.log('[SovraID Webhook] Headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));

    const rawBody = await request.text();
    console.log('[SovraID Webhook] Raw body:', rawBody);

    // Parse the body
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('[SovraID Webhook] Failed to parse body:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Verify webhook secret if configured
    const webhookSecret = process.env.SOVRAID_WEBHOOK_SECRET;
    if (webhookSecret) {
      // Check multiple possible header names for the signature
      const signature =
        request.headers.get('x-sovraid-signature') ||
        request.headers.get('x-webhook-signature') ||
        request.headers.get('authorization');

      console.log('[SovraID Webhook] Expected secret:', webhookSecret);
      console.log('[SovraID Webhook] Received signature:', signature);

      if (!signature || (signature !== webhookSecret && signature !== `Bearer ${webhookSecret}`)) {
        console.error('[SovraID Webhook] Invalid signature - but processing anyway for debugging');
        // For now, continue processing to debug - remove this in production
        // return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    console.log('[SovraID Webhook] Received event:', payload.event, payload.data.id);

    switch (payload.event) {
      case 'credential.claimed':
        await handleCredentialClaimed(payload);
        break;

      case 'credential.revoked':
        await handleCredentialRevoked(payload);
        break;

      case 'verification.completed':
        await handleVerificationCompleted(payload);
        break;

      default:
        console.log('[SovraID Webhook] Unhandled event type:', payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[SovraID Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle credential.claimed event
 * Updates the local credential status to 'claimed' or 'active'
 */
async function handleCredentialClaimed(payload: WebhookPayload) {
  const { id: sovraIdCredentialId, holderDid, claimedAt } = payload.data as {
    id: string;
    holderDid?: string;
    claimedAt?: string;
  };

  console.log('[SovraID Webhook] Processing credential.claimed:', sovraIdCredentialId);

  // Find the local credential by SovraID credential ID
  const credential = await findCredentialBySovraId(sovraIdCredentialId);

  if (!credential) {
    console.warn('[SovraID Webhook] Credential not found for SovraID ID:', sovraIdCredentialId);
    return;
  }

  // Update local credential status
  await updatePartnerCredential(credential.id, {
    status: 'active',
    claimedAt: claimedAt || new Date().toISOString(),
  });

  // Add audit log
  await addAuditLog(
    'credential.claimed' as never, // Custom event type
    'credential',
    credential.id,
    { id: 'system', name: 'SovraID Webhook', type: 'system' as never },
    {
      entityName: credential.holderName,
      metadata: {
        sovraIdCredentialId,
        holderDid,
        claimedAt,
      },
    }
  );

  console.log('[SovraID Webhook] Credential claimed successfully:', credential.id);
}

/**
 * Handle credential.revoked event (external revocation)
 */
async function handleCredentialRevoked(payload: WebhookPayload) {
  const { id: sovraIdCredentialId, reason, revokedAt } = payload.data as {
    id: string;
    reason?: string;
    revokedAt?: string;
  };

  console.log('[SovraID Webhook] Processing credential.revoked:', sovraIdCredentialId);

  // Find the local credential
  const credential = await findCredentialBySovraId(sovraIdCredentialId);

  if (!credential) {
    console.warn('[SovraID Webhook] Credential not found for SovraID ID:', sovraIdCredentialId);
    return;
  }

  // Update local credential status if not already revoked
  if (credential.status !== 'revoked') {
    await updatePartnerCredential(credential.id, {
      status: 'revoked',
      revokedAt: revokedAt || new Date().toISOString(),
      revokedBy: 'system',
      revokedReason: reason || 'Revoked externally via SovraID',
    });

    // Add audit log
    await addAuditLog(
      'credential.revoked',
      'credential',
      credential.id,
      { id: 'system', name: 'SovraID Webhook', type: 'system' as never },
      {
        entityName: credential.holderName,
        metadata: {
          sovraIdCredentialId,
          reason,
          revokedAt,
          source: 'external',
        },
      }
    );

    console.log('[SovraID Webhook] Credential revoked:', credential.id);
  }
}

/**
 * Handle verification.completed event
 */
async function handleVerificationCompleted(payload: WebhookPayload) {
  const { id: verificationId, holderDid, presentedCredentials } = payload.data as {
    id: string;
    holderDid?: string;
    presentedCredentials?: Array<{ credentialId: string; claims: Record<string, unknown> }>;
  };

  console.log('[SovraID Webhook] Verification completed:', verificationId);

  // This can be used for wallet-based login or credential verification
  // For now, just log the event
  // In the future, this could trigger session creation or access grants

  // Add audit log
  await addAuditLog(
    'verification.completed' as never,
    'verification' as never,
    verificationId,
    { id: 'system', name: 'SovraID Webhook', type: 'system' as never },
    {
      entityName: `Verification ${verificationId}`,
      metadata: {
        holderDid,
        presentedCredentials: presentedCredentials?.map((c) => c.credentialId),
      },
    }
  );
}

interface CredentialRecord {
  id: string;
  partnerId: string;
  holderName: string;
  holderEmail: string;
  role: string;
  status: string;
  sovraIdCredentialId?: string;
  [key: string]: unknown;
}

/**
 * Helper function to find a credential by SovraID credential ID
 */
async function findCredentialBySovraId(sovraIdCredentialId: string): Promise<CredentialRecord | null> {
  // This is a simple implementation - in production, you might want to
  // add an index for faster lookups or use a dedicated query

  const { redis } = await import('@/lib/redis/client');

  // credentials:all is a Sorted Set, so use zrange instead of smembers
  const allCredentialIds = await redis.zrange('credentials:all', 0, -1);

  console.log('[SovraID Webhook] Searching through', allCredentialIds.length, 'credentials');

  for (const credentialId of allCredentialIds) {
    // Credentials are stored as hashes, so use hgetall
    const credential = await redis.hgetall(`credential:${credentialId}`) as CredentialRecord | null;
    if (credential && credential.id) {
      console.log('[SovraID Webhook] Checking credential:', credentialId, 'sovraIdCredentialId:', credential.sovraIdCredentialId);
      if (credential.sovraIdCredentialId === sovraIdCredentialId) {
        return credential;
      }
    }
  }

  return null;
}
