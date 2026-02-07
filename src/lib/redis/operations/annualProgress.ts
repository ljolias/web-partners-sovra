import { redis } from '../client';

export async function updateAnnualProgress(
  partnerId: string,
  updates: {
    opportunities?: number;
    deals_won?: number;
    certifications?: number;
  }
): Promise<void> {
  const key = `partner:${partnerId}:annual:progress`;
  const pipeline = redis.pipeline();

  const hashUpdate: Record<string, string> = {};
  for (const [field, value] of Object.entries(updates)) {
    if (value !== undefined) {
      hashUpdate[field] = value.toString();
    }
  }

  if (Object.keys(hashUpdate).length > 0) {
    pipeline.hset(key, hashUpdate);
    await pipeline.exec();
  }
}

export async function getAnnualProgress(partnerId: string): Promise<{
  opportunities: number;
  deals_won: number;
  certifications: number;
}> {
  const key = `partner:${partnerId}:annual:progress`;
  const data = await redis.hgetall(key);

  return {
    opportunities: data && data.opportunities ? parseInt(data.opportunities as string) : 0,
    deals_won: data && data.deals_won ? parseInt(data.deals_won as string) : 0,
    certifications: data && data.certifications ? parseInt(data.certifications as string) : 0,
  };
}

export async function incrementAnnualMetric(
  partnerId: string,
  metric: 'opportunities' | 'deals_won' | 'certifications',
  amount: number = 1
): Promise<number> {
  const key = `partner:${partnerId}:annual:progress`;
  const result = await redis.hincrby(key, metric, amount);
  return typeof result === 'number' ? result : parseInt(String(result), 10);
}
