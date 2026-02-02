/**
 * DocuSign Webhook Processing
 *
 * Handle DocuSign Connect webhook events
 */

import {
  getLegalDocumentByEnvelopeId,
  updateLegalDocumentV2,
  addDocumentAuditLog,
} from '@/lib/redis/operations';
import { verifyWebhookSignature, getEnvelopeStatus, mapEnvelopeStatusToSigners } from './client';
import type { DocumentStatus, DocuSignMetadata } from '@/types';

export interface DocuSignWebhookEvent {
  event: string;
  apiVersion: string;
  uri: string;
  retryCount: number;
  configurationId: string;
  generatedDateTime: string;
  data: {
    accountId: string;
    userId: string;
    envelopeId: string;
    envelopeSummary?: {
      status: string;
      emailSubject: string;
      recipients?: {
        signers?: Array<{
          email: string;
          name: string;
          status: string;
          signedDateTime?: string;
          deliveredDateTime?: string;
          declinedDateTime?: string;
          declinedReason?: string;
          clientUserId?: string;
        }>;
      };
      sentDateTime?: string;
      completedDateTime?: string;
      voidedDateTime?: string;
      voidedReason?: string;
    };
  };
}

export type WebhookEventType =
  | 'envelope-sent'
  | 'envelope-delivered'
  | 'envelope-completed'
  | 'envelope-declined'
  | 'envelope-voided'
  | 'recipient-sent'
  | 'recipient-delivered'
  | 'recipient-completed'
  | 'recipient-declined';

/**
 * Process a DocuSign webhook event
 */
export async function processWebhookEvent(
  payload: string,
  signature: string
): Promise<{ success: boolean; message: string }> {
  // Verify webhook signature
  if (!verifyWebhookSignature(payload, signature)) {
    return { success: false, message: 'Invalid webhook signature' };
  }

  const event: DocuSignWebhookEvent = JSON.parse(payload);
  const { envelopeId } = event.data;

  if (!envelopeId) {
    return { success: false, message: 'Missing envelope ID in webhook payload' };
  }

  // Find the document associated with this envelope
  const document = await getLegalDocumentByEnvelopeId(envelopeId);

  if (!document) {
    console.warn(`No document found for envelope ${envelopeId}`);
    return { success: false, message: 'Document not found for envelope' };
  }

  // Process based on event type
  switch (event.event) {
    case 'envelope-sent':
      await handleEnvelopeSent(document.id, event);
      break;

    case 'envelope-delivered':
      await handleEnvelopeDelivered(document.id, event);
      break;

    case 'envelope-completed':
      await handleEnvelopeCompleted(document.id, event);
      break;

    case 'envelope-declined':
      await handleEnvelopeDeclined(document.id, event);
      break;

    case 'envelope-voided':
      await handleEnvelopeVoided(document.id, event);
      break;

    case 'recipient-completed':
      await handleRecipientCompleted(document.id, event);
      break;

    case 'recipient-declined':
      await handleRecipientDeclined(document.id, event);
      break;

    default:
      console.log(`Unhandled webhook event type: ${event.event}`);
  }

  return { success: true, message: `Processed ${event.event} event` };
}

async function handleEnvelopeSent(documentId: string, event: DocuSignWebhookEvent): Promise<void> {
  const summary = event.data.envelopeSummary;

  await updateLegalDocumentV2(documentId, {
    status: 'pending_signature',
    docusignMetadata: {
      envelopeId: event.data.envelopeId,
      envelopeStatus: 'sent',
      signers: mapSignersFromSummary(summary?.recipients?.signers),
      sentAt: summary?.sentDateTime || new Date().toISOString(),
    } as DocuSignMetadata,
  });

  await addDocumentAuditLog(
    documentId,
    'sent_for_signature',
    { type: 'system' },
    { event: 'envelope-sent', envelopeId: event.data.envelopeId }
  );
}

async function handleEnvelopeDelivered(documentId: string, event: DocuSignWebhookEvent): Promise<void> {
  const summary = event.data.envelopeSummary;

  await updateLegalDocumentV2(documentId, {
    docusignMetadata: {
      envelopeId: event.data.envelopeId,
      envelopeStatus: 'delivered',
      signers: mapSignersFromSummary(summary?.recipients?.signers),
      sentAt: summary?.sentDateTime,
    } as DocuSignMetadata,
  });
}

async function handleEnvelopeCompleted(documentId: string, event: DocuSignWebhookEvent): Promise<void> {
  const summary = event.data.envelopeSummary;

  await updateLegalDocumentV2(documentId, {
    status: 'active',
    docusignMetadata: {
      envelopeId: event.data.envelopeId,
      envelopeStatus: 'completed',
      signers: mapSignersFromSummary(summary?.recipients?.signers),
      sentAt: summary?.sentDateTime,
      completedAt: summary?.completedDateTime || new Date().toISOString(),
    } as DocuSignMetadata,
  });

  await addDocumentAuditLog(
    documentId,
    'signed',
    { type: 'system' },
    {
      event: 'envelope-completed',
      envelopeId: event.data.envelopeId,
      completedAt: summary?.completedDateTime,
    }
  );
}

async function handleEnvelopeDeclined(documentId: string, event: DocuSignWebhookEvent): Promise<void> {
  const summary = event.data.envelopeSummary;
  const declinedSigner = summary?.recipients?.signers?.find((s) => s.status === 'declined');

  await updateLegalDocumentV2(documentId, {
    status: 'archived',
    docusignMetadata: {
      envelopeId: event.data.envelopeId,
      envelopeStatus: 'declined',
      signers: mapSignersFromSummary(summary?.recipients?.signers),
    } as DocuSignMetadata,
  });

  await addDocumentAuditLog(
    documentId,
    'declined',
    { type: 'system' },
    {
      event: 'envelope-declined',
      envelopeId: event.data.envelopeId,
      declinedBy: declinedSigner?.email,
      reason: declinedSigner?.declinedReason,
    }
  );
}

async function handleEnvelopeVoided(documentId: string, event: DocuSignWebhookEvent): Promise<void> {
  const summary = event.data.envelopeSummary;

  await updateLegalDocumentV2(documentId, {
    status: 'archived',
    docusignMetadata: {
      envelopeId: event.data.envelopeId,
      envelopeStatus: 'voided',
      signers: mapSignersFromSummary(summary?.recipients?.signers),
    } as DocuSignMetadata,
  });

  await addDocumentAuditLog(
    documentId,
    'archived',
    { type: 'system' },
    {
      event: 'envelope-voided',
      envelopeId: event.data.envelopeId,
      reason: summary?.voidedReason,
    }
  );
}

async function handleRecipientCompleted(documentId: string, event: DocuSignWebhookEvent): Promise<void> {
  const summary = event.data.envelopeSummary;
  const signers = mapSignersFromSummary(summary?.recipients?.signers);

  // Check if all have signed
  const allSigned = signers.every((s) => s.status === 'signed');
  const someSigned = signers.some((s) => s.status === 'signed');

  let newStatus: DocumentStatus = 'pending_signature';
  if (allSigned) {
    newStatus = 'active';
  } else if (someSigned) {
    newStatus = 'partially_signed';
  }

  await updateLegalDocumentV2(documentId, {
    status: newStatus,
    docusignMetadata: {
      envelopeId: event.data.envelopeId,
      envelopeStatus: allSigned ? 'completed' : 'delivered',
      signers,
      sentAt: summary?.sentDateTime,
      completedAt: allSigned ? summary?.completedDateTime : undefined,
    } as DocuSignMetadata,
  });

  // Find who just signed
  const justSigned = summary?.recipients?.signers?.find(
    (s) => s.status === 'completed' && s.signedDateTime
  );

  if (justSigned) {
    await addDocumentAuditLog(
      documentId,
      'signed',
      {
        type: justSigned.email.includes('@sovra') ? 'sovra' : 'partner',
        name: justSigned.name,
      },
      {
        event: 'recipient-completed',
        email: justSigned.email,
        signedAt: justSigned.signedDateTime,
      }
    );
  }
}

async function handleRecipientDeclined(documentId: string, event: DocuSignWebhookEvent): Promise<void> {
  const summary = event.data.envelopeSummary;
  const declinedSigner = summary?.recipients?.signers?.find((s) => s.status === 'declined');

  await updateLegalDocumentV2(documentId, {
    docusignMetadata: {
      envelopeId: event.data.envelopeId,
      envelopeStatus: 'declined',
      signers: mapSignersFromSummary(summary?.recipients?.signers),
    } as DocuSignMetadata,
  });

  if (declinedSigner) {
    await addDocumentAuditLog(
      documentId,
      'declined',
      {
        type: declinedSigner.email.includes('@sovra') ? 'sovra' : 'partner',
        name: declinedSigner.name,
      },
      {
        event: 'recipient-declined',
        email: declinedSigner.email,
        reason: declinedSigner.declinedReason,
      }
    );
  }
}

function mapSignersFromSummary(
  signers?: Array<{
    email: string;
    name: string;
    status: string;
    signedDateTime?: string;
  }>
): DocuSignMetadata['signers'] {
  if (!signers) return [];

  return signers.map((s) => ({
    email: s.email,
    name: s.name,
    role: s.email.includes('@sovra') ? 'sovra' as const : 'partner' as const,
    status: mapStatus(s.status),
    signedAt: s.signedDateTime,
  }));
}

function mapStatus(status: string): 'pending' | 'sent' | 'delivered' | 'signed' | 'declined' {
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
 * Sync document status from DocuSign (for recovery/manual sync)
 */
export async function syncDocumentFromDocuSign(documentId: string, envelopeId: string): Promise<void> {
  const envelopeStatus = await getEnvelopeStatus(envelopeId);
  const signers = mapEnvelopeStatusToSigners(envelopeStatus);

  const allSigned = signers.every((s) => s.status === 'signed');
  const someSigned = signers.some((s) => s.status === 'signed');
  const anyDeclined = signers.some((s) => s.status === 'declined');

  let status: DocumentStatus = 'pending_signature';
  let envelopeDocuSignStatus: DocuSignMetadata['envelopeStatus'] = 'sent';

  if (envelopeStatus.status === 'completed' || allSigned) {
    status = 'active';
    envelopeDocuSignStatus = 'completed';
  } else if (envelopeStatus.status === 'voided') {
    status = 'archived';
    envelopeDocuSignStatus = 'voided';
  } else if (anyDeclined) {
    status = 'archived';
    envelopeDocuSignStatus = 'declined';
  } else if (someSigned) {
    status = 'partially_signed';
    envelopeDocuSignStatus = 'delivered';
  }

  await updateLegalDocumentV2(documentId, {
    status,
    docusignMetadata: {
      envelopeId,
      envelopeStatus: envelopeDocuSignStatus,
      signers,
    } as DocuSignMetadata,
  });
}
