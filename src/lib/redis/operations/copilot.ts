import { redis } from '../client';
import { keys, TTL } from '../keys';
import type { CopilotSession, CopilotMessage, MEDDICScores } from '@/types';
import { toRedisHash, generateId } from './helpers';

export async function createCopilotSession(dealId: string, userId: string): Promise<CopilotSession> {
  const session: CopilotSession = {
    id: generateId(),
    dealId,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const pipeline = redis.pipeline();
  pipeline.hset(keys.copilotSession(session.id), toRedisHash(session));
  pipeline.expire(keys.copilotSession(session.id), TTL.copilotSession);
  pipeline.sadd(keys.dealCopilotSessions(dealId), session.id);
  await pipeline.exec();

  return session;
}

export async function getCopilotSession(id: string): Promise<CopilotSession | null> {
  const session = await redis.hgetall(keys.copilotSession(id)) as CopilotSession | null;
  if (!session || !session.id) return null;
  return session;
}

export async function addCopilotMessage(sessionId: string, message: CopilotMessage): Promise<void> {
  await redis.rpush(keys.copilotMessages(sessionId), JSON.stringify(message));
}

export async function getCopilotMessages(sessionId: string): Promise<CopilotMessage[]> {
  const messages = await redis.lrange<string>(keys.copilotMessages(sessionId), 0, -1);
  return messages.map((m) => (typeof m === 'string' ? JSON.parse(m) : m));
}

export async function updateCopilotMeddic(sessionId: string, scores: Partial<MEDDICScores>): Promise<void> {
  await redis.hset(keys.copilotMeddic(sessionId), toRedisHash(scores as Record<string, number>));
}

export async function getCopilotMeddic(sessionId: string): Promise<Partial<MEDDICScores>> {
  return (await redis.hgetall(keys.copilotMeddic(sessionId))) as Partial<MEDDICScores> || {};
}
