import { redis } from '../client';
import { keys } from '../keys';
import type { LegacyLegalDocument, LegalSignature } from '@/types';
import { toRedisHash } from './helpers';

export async function getLegalDocument(id: string): Promise<LegacyLegalDocument | null> {
  const doc = await redis.hgetall(keys.legalDocument(id)) as LegacyLegalDocument | null;
  if (!doc || !doc.id) return null;
  if (typeof doc.title === 'string') doc.title = JSON.parse(doc.title);
  if (typeof doc.content === 'string') doc.content = JSON.parse(doc.content);
  return doc;
}

export async function getAllLegalDocuments(): Promise<LegacyLegalDocument[]> {
  const docIds = await redis.smembers<string[]>(keys.legalDocuments());
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocument(id)));
  return docs.filter((d): d is LegacyLegalDocument => d !== null);
}

export async function createLegalDocument(doc: LegacyLegalDocument): Promise<void> {
  const docData = {
    ...doc,
    title: JSON.stringify(doc.title),
    content: JSON.stringify(doc.content),
  };

  const pipeline = redis.pipeline();
  pipeline.hset(keys.legalDocument(doc.id), toRedisHash(docData));
  pipeline.sadd(keys.legalDocuments(), doc.id);
  await pipeline.exec();
}

export async function signLegalDocument(signature: LegalSignature): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.hset(keys.legalSignature(signature.id), toRedisHash(signature));
  pipeline.sadd(keys.userSignatures(signature.userId), signature.id);
  pipeline.sadd(keys.partnerSignatures(signature.partnerId), signature.id);
  await pipeline.exec();
}

export async function getUserSignatures(userId: string): Promise<LegalSignature[]> {
  const sigIds = await redis.smembers<string[]>(keys.userSignatures(userId));
  if (!sigIds.length) return [];
  const sigs = await Promise.all(
    sigIds.map((id) => redis.hgetall(keys.legalSignature(id)) as Promise<LegalSignature | null>)
  );
  return sigs.filter((s): s is LegalSignature => s !== null && !!s.id);
}

export async function hasSignedRequiredDocs(userId: string): Promise<boolean> {
  const [docs, signatures] = await Promise.all([
    getAllLegalDocuments(),
    getUserSignatures(userId),
  ]);

  const requiredDocs = docs.filter((d) => d.requiredForDeals);
  const signedDocIds = new Set(signatures.map((s) => s.documentId));

  return requiredDocs.every((doc) => signedDocIds.has(doc.id));
}
