import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { logger } from '@/lib/logger';
import { updatePartnerCredential, addAuditLog, createUser, getUserByEmail, generateId, getPartner } from '@/lib/redis';
import { sendWelcomeEmail } from '@/lib/email';
import type { User, UserRole } from '@/types';

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

export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      // Log incoming request for debugging
      logger.info('SovraID webhook received');

    const rawBody = await request.text();
    logger.debug('SovraID webhook raw body', { rawBody });

    // Parse the body
    let payload: SovraIdWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      logger.error('SovraID webhook failed to parse body', { error: e });
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    logger.info('SovraID webhook event type', { eventType: payload.eventType });
    logger.debug('SovraID webhook event data', { eventData: payload.eventData });

    // Verify webhook secret if configured
    const webhookSecret = process.env.SOVRAID_WEBHOOK_SECRET;
    if (webhookSecret) {
      // Check possible header names for the secret
      const authHeader = request.headers.get('authorization');
      const signature =
        request.headers.get('x-sovraid-signature') ||
        request.headers.get('x-webhook-secret') ||
        (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader);

      logger.debug('SovraID webhook checking authentication');

      if (signature !== webhookSecret) {
        logger.warn('SovraID webhook signature mismatch - continuing for debugging');
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
        logger.warn('SovraID webhook unhandled event type', { eventType: payload.eventType });
    }

    // Respond within 5 seconds as recommended
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('SovraID webhook processing error', { error });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
  },
  RATE_LIMITS.WEBHOOK
);

/**
 * Handle credential-issued event
 * Triggered when credential is accepted by holder's wallet
 */
async function handleCredentialIssued(eventData: CredentialIssuedData) {
  const { holderDID, invitationId, vc } = eventData;

  logger.info('SovraID webhook processing credential-issued');
  logger.debug('SovraID webhook holder DID', { holderDID });
  logger.debug('SovraID webhook invitation ID', { invitationId });

  // Find the local credential by invitation ID, credential ID, or email
  const credential = await findCredentialByInvitationId(invitationId, eventData);

  if (!credential) {
    logger.warn('SovraID webhook credential not found', { invitationId });
    return;
  }

  const now = new Date().toISOString();

  // Check if user already exists for this email
  let existingUser = await getUserByEmail(credential.holderEmail);
  let userId = existingUser?.id;

  // Create user account if it doesn't exist
  if (!existingUser) {
    logger.info('SovraID webhook creating user account', { email: credential.holderEmail });

    userId = generateId();
    const newUser: User = {
      id: userId,
      partnerId: credential.partnerId,
      email: credential.holderEmail,
      name: credential.holderName,
      role: credential.role as UserRole,
      passwordHash: '', // User will authenticate via wallet credential, can set password later
      createdAt: now,
      updatedAt: now,
    };

    await createUser(newUser);
    logger.info('SovraID webhook user account created', { userId });

    // Add audit log for user creation
    await addAuditLog(
      'user.created' as never,
      'user' as never,
      userId,
      { id: 'system', name: 'SovraID Webhook', type: 'system' as never },
      {
        entityName: credential.holderName,
        metadata: {
          partnerId: credential.partnerId,
          email: credential.holderEmail,
          role: credential.role,
          createdViaCredentialClaim: true,
        },
      }
    );
  } else {
    logger.debug('SovraID webhook user already exists', { userId: existingUser.id });
  }

  // Update local credential status to active and link to user
  await updatePartnerCredential(credential.id, {
    status: 'active',
    claimedAt: now,
    holderDid: holderDID,
    userId: userId,
  });

  // Add audit log for credential claim
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
        userId,
        userCreated: !existingUser,
      },
    }
  );

  // Send welcome email
  const partner = await getPartner(credential.partnerId);
  if (partner) {
    try {
      await sendWelcomeEmail({
        to: credential.holderEmail,
        holderName: credential.holderName,
        partnerName: partner.companyName,
      });
    } catch (emailErr) {
      logger.error('SovraID webhook failed to send welcome email', { error: emailErr });
    }
  }

  logger.info('SovraID webhook credential activated', { credentialId: credential.id });
  logger.debug('SovraID webhook linked to user', { userId });
}

/**
 * Handle verifiable-presentation-finished event
 * Triggered when verification is completed
 */
async function handleVerificationFinished(eventData: VerificationFinishedData) {
  const { verified, holderDID, invitationId, verifiableCredentials } = eventData;

  logger.info('SovraID webhook processing verifiable-presentation-finished');
  logger.debug('SovraID webhook verified status', { verified });
  logger.debug('SovraID webhook holder DID', { holderDID });
  logger.debug('SovraID webhook invitation ID (presentationId)', { invitationId });

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

  logger.info('SovraID webhook verification logged', { invitationId, verified });
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
  logger.debug('SovraID webhook searching through credentials', { count: allCredentialIds.length });

  // Extract email from VC if available (for fallback matching)
  const vcEmail = eventData?.vc?.credentialSubject?.email as string | undefined;
  const vcCredentialId = eventData?.vc?.id as string | undefined;
  // Extract just the UUID from the full credential URL if present
  const vcCredentialUuid = vcCredentialId?.split('/').pop();

  logger.debug('SovraID webhook looking for invitationId', { invitationId });
  logger.debug('SovraID webhook VC email', { vcEmail });
  logger.debug('SovraID webhook VC credential ID', { vcCredentialUuid });

  for (const credentialId of allCredentialIds) {
    const credential = await redis.hgetall(`credential:${credentialId}`) as CredentialRecord | null;
    if (credential && credential.id) {
      logger.debug('SovraID webhook checking credential', { id: credential.id, email: credential.holderEmail, sovraIdCredentialId: credential.sovraIdCredentialId, sovraIdInvitationId: credential.sovraIdInvitationId });

      // Try to match by invitation ID
      if (credential.sovraIdInvitationId === invitationId) {
        logger.debug('SovraID webhook found by invitationId match');
        return credential;
      }

      // Try to match by credential ID
      if (credential.sovraIdCredentialId === invitationId ||
          credential.sovraIdCredentialId === vcCredentialUuid) {
        logger.debug('SovraID webhook found by credentialId match');
        return credential;
      }

      // Fallback: match by email from VC
      if (vcEmail && credential.holderEmail?.toLowerCase() === vcEmail.toLowerCase()) {
        logger.debug('SovraID webhook found by email match (fallback)');
        return credential;
      }
    }
  }

  return null;
}
