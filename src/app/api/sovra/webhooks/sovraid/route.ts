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
    // Verify webhook secret if configured
    const webhookSecret = process.env.SOVRAID_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-sovraid-signature');
      if (!signature || signature !== webhookSecret) {
        console.error('[SovraID Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload: WebhookPayload = await request.json();
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

/**
 * Helper function to find a credential by SovraID credential ID
 */
async function findCredentialBySovraId(sovraIdCredentialId: string) {
  // This is a simple implementation - in production, you might want to
  // add an index for faster lookups or use a dedicated query

  // Check all partners (this is inefficient but works for now)
  // In a real implementation, you'd want a reverse index: sovraIdCredentialId -> credentialId
  const { redis } = await import('@/lib/redis/client');
  const allCredentialIds = await redis.smembers('credentials:all');

  for (const credentialId of allCredentialIds) {
    const credential = await redis.get(`credential:${credentialId}`);
    if (credential) {
      const parsed = typeof credential === 'string' ? JSON.parse(credential) : credential;
      if (parsed.sovraIdCredentialId === sovraIdCredentialId) {
        return parsed;
      }
    }
  }

  return null;
}
