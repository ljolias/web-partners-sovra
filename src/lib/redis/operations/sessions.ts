import { redis } from '../client';
import { keys, TTL } from '../keys';
import type { Session } from '@/types';
import { toRedisHash, generateId } from './helpers';

export async function createSession(userId: string, partnerId: string): Promise<Session> {
  const session: Session = {
    id: generateId(),
    userId,
    partnerId,
    expiresAt: new Date(Date.now() + TTL.session * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  await redis.hset(keys.session(session.id), toRedisHash(session));
  await redis.expire(keys.session(session.id), TTL.session);
  return session;
}

export async function getSession(id: string): Promise<Session | null> {
  const session = await redis.hgetall(keys.session(id)) as Session | null;
  if (!session || !session.id) return null;
  if (new Date(session.expiresAt) < new Date()) {
    await deleteSession(id);
    return null;
  }
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  await redis.del(keys.session(id));
}
