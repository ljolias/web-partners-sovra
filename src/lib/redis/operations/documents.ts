import { logger } from '@/lib/logger';
import { redis } from '../client';
import { keys } from '../keys';
import type { LegalDocument, DocumentCategory, DocumentStatus, DocumentAuditEvent } from '@/types';
import { toRedisHash, generateId } from './helpers';
export async function getLegalDocumentV2(id: string): Promise<LegalDocument | null> {
  const doc = await redis.hgetall(keys.legalDocumentV2(id)) as LegalDocument | null;
  if (!doc || !doc.id) return null;
  // Parse JSON fields (handle empty strings)
  if (typeof doc.docusignMetadata === 'string' && doc.docusignMetadata) {
    doc.docusignMetadata = JSON.parse(doc.docusignMetadata);
  } else {
    doc.docusignMetadata = undefined;
  }
  if (typeof doc.uploadMetadata === 'string' && doc.uploadMetadata) {
    doc.uploadMetadata = JSON.parse(doc.uploadMetadata);
  } else {
    doc.uploadMetadata = undefined;
  }
  // Parse numbers
  if (typeof doc.version === 'string') doc.version = parseInt(doc.version, 10);
  return doc;
}

export async function getPartnerLegalDocuments(partnerId: string, limit = 100): Promise<LegalDocument[]> {
  logger.debug('Fetching documents for partner', { partnerId, key: keys.partnerLegalDocuments(partnerId) });
  const docIds = await redis.zrange<string[]>(keys.partnerLegalDocuments(partnerId), 0, limit - 1, {
    rev: true,
  });
  logger.debug('Found document IDs', { count: docIds.length, docIds });
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocumentV2(id)));
  return docs.filter((d): d is LegalDocument => d !== null);
}

export async function getAllLegalDocumentsV2(limit = 100): Promise<LegalDocument[]> {
  const docIds = await redis.zrange<string[]>(keys.allLegalDocumentsV2(), 0, limit - 1, {
    rev: true,
  });
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocumentV2(id)));
  return docs.filter((d): d is LegalDocument => d !== null);
}

export async function getLegalDocumentsByCategory(category: DocumentCategory, limit = 100): Promise<LegalDocument[]> {
  const docIds = await redis.smembers<string[]>(keys.legalDocumentsByCategory(category));
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocumentV2(id)));
  return docs.filter((d): d is LegalDocument => d !== null).slice(0, limit);
}

export async function getLegalDocumentsByStatus(status: DocumentStatus, limit = 100): Promise<LegalDocument[]> {
  const docIds = await redis.smembers<string[]>(keys.legalDocumentsByStatus(status));
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocumentV2(id)));
  return docs.filter((d): d is LegalDocument => d !== null).slice(0, limit);
}

export async function createLegalDocumentV2(doc: LegalDocument): Promise<void> {
  logger.debug('Creating legal document', { documentId: doc.id, partnerId: doc.partnerId });

  const pipeline = redis.pipeline();

  const docData = {
    ...doc,
    docusignMetadata: doc.docusignMetadata ? JSON.stringify(doc.docusignMetadata) : '',
    uploadMetadata: doc.uploadMetadata ? JSON.stringify(doc.uploadMetadata) : '',
  };

  pipeline.hset(keys.legalDocumentV2(doc.id), toRedisHash(docData));

  // Add to partner's documents sorted by creation time
  pipeline.zadd(keys.partnerLegalDocuments(doc.partnerId), {
    score: new Date(doc.createdAt).getTime(),
    member: doc.id,
  });

  // Add to all documents index
  pipeline.zadd(keys.allLegalDocumentsV2(), {
    score: new Date(doc.createdAt).getTime(),
    member: doc.id,
  });

  // Add to category index
  pipeline.sadd(keys.legalDocumentsByCategory(doc.category), doc.id);

  // Add to status index
  pipeline.sadd(keys.legalDocumentsByStatus(doc.status), doc.id);

  // If DocuSign document, create envelope mapping
  if (doc.type === 'docusign' && doc.docusignMetadata?.envelopeId) {
    pipeline.set(keys.docusignEnvelope(doc.docusignMetadata.envelopeId), doc.id);
  }

  await pipeline.exec();
}

export async function updateLegalDocumentV2(id: string, updates: Partial<LegalDocument>): Promise<void> {
  const doc = await getLegalDocumentV2(id);
  if (!doc) throw new Error('Document not found');

  const pipeline = redis.pipeline();

  const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };

  // Serialize nested objects
  if (updates.docusignMetadata) updateData.docusignMetadata = JSON.stringify(updates.docusignMetadata);
  if (updates.uploadMetadata) updateData.uploadMetadata = JSON.stringify(updates.uploadMetadata);

  pipeline.hset(keys.legalDocumentV2(id), toRedisHash(updateData as Record<string, unknown>));

  // Update status index if changed
  if (updates.status && updates.status !== doc.status) {
    pipeline.srem(keys.legalDocumentsByStatus(doc.status), id);
    pipeline.sadd(keys.legalDocumentsByStatus(updates.status), id);
  }

  // Update category index if changed
  if (updates.category && updates.category !== doc.category) {
    pipeline.srem(keys.legalDocumentsByCategory(doc.category), id);
    pipeline.sadd(keys.legalDocumentsByCategory(updates.category), id);
  }

  await pipeline.exec();
}

export async function getLegalDocumentByEnvelopeId(envelopeId: string): Promise<LegalDocument | null> {
  const docId = await redis.get<string>(keys.docusignEnvelope(envelopeId));
  if (!docId) return null;
  return getLegalDocumentV2(docId);
}

// ============ Document Audit Operations ============

export async function createDocumentAuditEvent(event: DocumentAuditEvent): Promise<void> {
  const pipeline = redis.pipeline();

  pipeline.hset(keys.documentAuditEvent(event.id), toRedisHash(event));
  pipeline.zadd(keys.documentAuditEvents(event.documentId), {
    score: new Date(event.timestamp).getTime(),
    member: event.id,
  });

  await pipeline.exec();
}

export async function getDocumentAuditEvents(documentId: string, limit = 50): Promise<DocumentAuditEvent[]> {
  const eventIds = await redis.zrange<string[]>(keys.documentAuditEvents(documentId), 0, limit - 1, {
    rev: true,
  });
  if (!eventIds.length) return [];

  const events = await Promise.all(
    eventIds.map(async (id) => {
      const event = await redis.hgetall(keys.documentAuditEvent(id)) as DocumentAuditEvent | null;
      if (!event || !event.id) return null;
      if (typeof event.details === 'string') event.details = JSON.parse(event.details);
      return event;
    })
  );

  return events.filter((e): e is DocumentAuditEvent => e !== null);
}

export async function addDocumentAuditLog(
  documentId: string,
  action: DocumentAuditEvent['action'],
  actor: { type: 'partner' | 'sovra' | 'system'; id?: string; name?: string },
  details?: Record<string, unknown>,
  request?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  const event: DocumentAuditEvent = {
    id: generateId(),
    documentId,
    action,
    actorType: actor.type,
    actorId: actor.id,
    actorName: actor.name,
    details,
    ipAddress: request?.ipAddress,
    userAgent: request?.userAgent,
    timestamp: new Date().toISOString(),
  };

  await createDocumentAuditEvent(event);
}

// ============ Partner Pending Documents ============

export async function getPartnerPendingDocuments(partnerId: string): Promise<LegalDocument[]> {
  const docs = await getPartnerLegalDocuments(partnerId);
  return docs.filter(
    (doc) =>
      doc.status === 'pending_signature' ||
      (doc.type === 'upload' &&
        doc.uploadMetadata?.verificationStatus === 'pending' &&
        doc.uploadMetadata?.uploadedBy === 'partner')
  );
}

export async function getPartnerDocumentsRequiringAction(partnerId: string): Promise<{
  pendingSignature: LegalDocument[];
  expiringSOon: LegalDocument[];
}> {
  const docs = await getPartnerLegalDocuments(partnerId);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const pendingSignature = docs.filter(
    (doc) => doc.status === 'pending_signature' || doc.status === 'partially_signed'
  );

  const expiringSOon = docs.filter((doc) => {
    if (!doc.expirationDate || doc.status !== 'active') return false;
    const expDate = new Date(doc.expirationDate);
    return expDate > now && expDate <= thirtyDaysFromNow;
  });

  return { pendingSignature, expiringSOon };
}
