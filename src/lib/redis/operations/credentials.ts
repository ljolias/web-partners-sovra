import { redis } from '../client';
import { keys } from '../keys';
import type { PartnerCredential, CredentialStatus } from '@/types';
import { toRedisHash } from './helpers';

export async function getPartnerCredential(id: string): Promise<PartnerCredential | null> {
  const credential = await redis.hgetall(keys.partnerCredential(id)) as PartnerCredential | null;
  if (!credential || !credential.id) return null;
  return credential;
}

export async function getPartnerCredentials(partnerId: string, limit = 100): Promise<PartnerCredential[]> {
  const credentialIds = await redis.zrange<string[]>(keys.partnerCredentials(partnerId), 0, limit - 1, {
    rev: true,
  });
  if (!credentialIds.length) return [];
  const credentials = await Promise.all(credentialIds.map((id) => getPartnerCredential(id)));
  return credentials.filter((c): c is PartnerCredential => c !== null);
}

export async function getCredentialsByStatus(status: CredentialStatus): Promise<PartnerCredential[]> {
  const credentialIds = await redis.smembers<string[]>(keys.credentialsByStatus(status));
  if (!credentialIds.length) return [];
  const credentials = await Promise.all(credentialIds.map((id) => getPartnerCredential(id)));
  return credentials.filter((c): c is PartnerCredential => c !== null);
}

export async function getCredentialByEmail(email: string): Promise<PartnerCredential | null> {
  const credentialId = await redis.get<string>(keys.credentialByEmail(email));
  if (!credentialId) return null;
  return getPartnerCredential(credentialId);
}

export async function createPartnerCredential(credential: PartnerCredential): Promise<void> {
  const pipeline = redis.pipeline();

  pipeline.hset(keys.partnerCredential(credential.id), toRedisHash(credential));

  // Add to partner's credentials sorted by creation time
  pipeline.zadd(keys.partnerCredentials(credential.partnerId), {
    score: new Date(credential.createdAt).getTime(),
    member: credential.id,
  });

  // Add to all credentials index
  pipeline.zadd(keys.allCredentials(), {
    score: new Date(credential.createdAt).getTime(),
    member: credential.id,
  });

  // Add to status index
  pipeline.sadd(keys.credentialsByStatus(credential.status), credential.id);

  // Add email index
  pipeline.set(keys.credentialByEmail(credential.holderEmail), credential.id);

  await pipeline.exec();
}

export async function updatePartnerCredential(id: string, updates: Partial<PartnerCredential>): Promise<void> {
  const credential = await getPartnerCredential(id);
  if (!credential) throw new Error('Credential not found');

  const pipeline = redis.pipeline();

  const updateData = { ...updates, updatedAt: new Date().toISOString() };
  pipeline.hset(keys.partnerCredential(id), toRedisHash(updateData as Record<string, unknown>));

  // Update status index if changed
  if (updates.status && updates.status !== credential.status) {
    pipeline.srem(keys.credentialsByStatus(credential.status), id);
    pipeline.sadd(keys.credentialsByStatus(updates.status), id);
  }

  await pipeline.exec();
}

export async function revokePartnerCredential(
  id: string,
  revokedBy: string,
  reason: string
): Promise<void> {
  await updatePartnerCredential(id, {
    status: 'revoked',
    revokedAt: new Date().toISOString(),
    revokedBy,
    revokedReason: reason,
  });
}

export async function revokeAllPartnerCredentials(
  partnerId: string,
  revokedBy: string,
  reason: string
): Promise<void> {
  const credentials = await getPartnerCredentials(partnerId);
  const activeCredentials = credentials.filter(c => ['active', 'claimed', 'issued'].includes(c.status));

  for (const credential of activeCredentials) {
    await revokePartnerCredential(credential.id, revokedBy, reason);
  }
}
