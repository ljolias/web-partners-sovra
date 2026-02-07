import { redis } from '../client';
import { keys } from '../keys';
import type { User } from '@/types';
import { toRedisHash } from './helpers';

export async function getUser(id: string): Promise<User | null> {
  const user = await redis.hgetall(keys.user(id)) as User | null;
  if (!user || !user.id) return null;
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const userId = await redis.get<string>(keys.userByEmail(email));
  if (!userId) return null;
  return getUser(userId);
}

export async function createUser(user: User): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.hset(keys.user(user.id), toRedisHash(user));
  pipeline.set(keys.userByEmail(user.email), user.id);
  pipeline.sadd(keys.partnerUsers(user.partnerId), user.id);
  await pipeline.exec();
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  await redis.hset(keys.user(id), toRedisHash({ ...updates, updatedAt: new Date().toISOString() }));
}

export async function getPartnerUsers(partnerId: string): Promise<User[]> {
  const userIds = await redis.smembers<string[]>(keys.partnerUsers(partnerId));
  if (!userIds.length) return [];
  const users = await Promise.all(userIds.map((id) => getUser(id)));
  return users.filter((u): u is User => u !== null);
}
