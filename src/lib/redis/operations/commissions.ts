import { redis } from '../client';
import { keys } from '../keys';
import type { Commission } from '@/types';
import { toRedisHash } from './helpers';

export async function getCommission(id: string): Promise<Commission | null> {
  const commission = await redis.hgetall(keys.commission(id)) as Commission | null;
  if (!commission || !commission.id) return null;
  return commission;
}

export async function getPartnerCommissions(partnerId: string): Promise<Commission[]> {
  const commIds = await redis.smembers<string[]>(keys.partnerCommissions(partnerId));
  if (!commIds.length) return [];
  const comms = await Promise.all(commIds.map((id) => getCommission(id)));
  return comms.filter((c): c is Commission => c !== null);
}

export async function createCommission(commission: Commission): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.hset(keys.commission(commission.id), toRedisHash(commission));
  pipeline.sadd(keys.partnerCommissions(commission.partnerId), commission.id);
  pipeline.set(keys.dealCommission(commission.dealId), commission.id);
  await pipeline.exec();
}

export async function updateCommission(id: string, updates: Partial<Commission>): Promise<void> {
  await redis.hset(keys.commission(id), toRedisHash(updates as Record<string, unknown>));
}
