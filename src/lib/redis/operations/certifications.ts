import { redis } from '../client';
import { keys } from '../keys';
import type { Certification } from '@/types';
import { toRedisHash } from './helpers';

export async function getCertification(id: string): Promise<Certification | null> {
  const cert = await redis.hgetall(keys.certification(id)) as Certification | null;
  if (!cert || !cert.id) return null;
  return cert;
}

export async function getUserCertifications(userId: string): Promise<Certification[]> {
  const certIds = await redis.smembers<string[]>(keys.userCertifications(userId));
  if (!certIds.length) return [];
  const certs = await Promise.all(certIds.map((id) => getCertification(id)));
  return certs.filter((c): c is Certification => c !== null);
}

export async function createCertification(cert: Certification): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.hset(keys.certification(cert.id), toRedisHash(cert));
  pipeline.sadd(keys.userCertifications(cert.userId), cert.id);
  pipeline.sadd(keys.partnerCertifications(cert.partnerId), cert.id);
  await pipeline.exec();
}

export async function hasValidCertification(userId: string): Promise<boolean> {
  const certs = await getUserCertifications(userId);
  return certs.some(
    (cert) => cert.status === 'active' && new Date(cert.expiresAt) > new Date()
  );
}
