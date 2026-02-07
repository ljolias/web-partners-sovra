import { redis } from '../client';

export async function recordAchievement(
  partnerId: string,
  achievementId: string,
  completedAt: string = new Date().toISOString()
): Promise<void> {
  const key = `partner:achievements:${partnerId}`;
  await redis.hset(key, { [achievementId]: completedAt });
}

export async function getAchievements(partnerId: string): Promise<Record<string, string>> {
  const key = `partner:achievements:${partnerId}`;
  const data = await redis.hgetall(key);
  return (data as Record<string, string>) || {};
}

export async function removeAchievementRecord(partnerId: string, achievementId: string): Promise<void> {
  const key = `partner:achievements:${partnerId}`;
  await redis.hdel(key, achievementId);
}
