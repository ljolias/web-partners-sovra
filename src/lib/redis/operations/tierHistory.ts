import { redis } from '../client';
import type { PartnerTier } from '@/types';

export async function recordTierChange(
  partnerId: string,
  tier: PartnerTier,
  reason: 'achievement' | 'annual_renewal' | 'manual',
  previousTier?: PartnerTier
): Promise<void> {
  const key = `partner:${partnerId}:tier:history`;
  const entry = {
    tier,
    changedAt: new Date().toISOString(),
    reason,
    previousTier: previousTier || '',
  };

  const pipeline = redis.pipeline();
  pipeline.zadd(key, {
    score: Date.now(),
    member: JSON.stringify(entry),
  });

  // Also update the partner's current tier
  pipeline.hset(`partner:${partnerId}`, { tier });

  await pipeline.exec();
}

export async function getTierHistory(partnerId: string, limit = 50): Promise<Array<{
  tier: PartnerTier;
  changedAt: string;
  reason: 'achievement' | 'annual_renewal' | 'manual';
  previousTier?: PartnerTier;
}>> {
  const key = `partner:${partnerId}:tier:history`;
  const entries = await redis.zrange<string[]>(key, 0, limit - 1, { rev: true });

  return entries.map((entry) => JSON.parse(entry));
}
