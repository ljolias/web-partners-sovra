import { redis } from '../client';
import { keys } from '../keys';
import type { AuditLog, AuditAction } from '@/types';
import { toRedisHash, generateId } from './helpers';

export async function createAuditLog(log: AuditLog): Promise<void> {
  const pipeline = redis.pipeline();

  const logData = {
    ...log,
    changes: log.changes ? JSON.stringify(log.changes) : '',
    metadata: log.metadata ? JSON.stringify(log.metadata) : '',
  };

  pipeline.hset(keys.auditLog(log.id), toRedisHash(logData));

  // Add to all logs sorted by timestamp
  pipeline.zadd(keys.allAuditLogs(), {
    score: new Date(log.timestamp).getTime(),
    member: log.id,
  });

  // Add to entity index
  pipeline.zadd(keys.auditLogsByEntity(log.entityType, log.entityId), {
    score: new Date(log.timestamp).getTime(),
    member: log.id,
  });

  // Add to action index
  pipeline.sadd(keys.auditLogsByAction(log.action), log.id);

  // Add to actor index
  if (log.actorId) {
    pipeline.zadd(keys.auditLogsByActor(log.actorId), {
      score: new Date(log.timestamp).getTime(),
      member: log.id,
    });
  }

  await pipeline.exec();
}

export async function getAuditLog(id: string): Promise<AuditLog | null> {
  const log = await redis.hgetall(keys.auditLog(id)) as AuditLog | null;
  if (!log || !log.id) return null;
  // Parse JSON fields
  if (typeof log.changes === 'string' && log.changes) log.changes = JSON.parse(log.changes);
  if (typeof log.metadata === 'string' && log.metadata) log.metadata = JSON.parse(log.metadata);
  return log;
}

export async function getAllAuditLogs(limit = 100, offset = 0): Promise<AuditLog[]> {
  const logIds = await redis.zrange<string[]>(keys.allAuditLogs(), offset, offset + limit - 1, {
    rev: true,
  });
  if (!logIds.length) return [];
  const logs = await Promise.all(logIds.map((id) => getAuditLog(id)));
  return logs.filter((l): l is AuditLog => l !== null);
}

export async function getAuditLogsByEntity(
  entityType: string,
  entityId: string,
  limit = 50
): Promise<AuditLog[]> {
  const logIds = await redis.zrange<string[]>(
    keys.auditLogsByEntity(entityType, entityId),
    0,
    limit - 1,
    { rev: true }
  );
  if (!logIds.length) return [];
  const logs = await Promise.all(logIds.map((id) => getAuditLog(id)));
  return logs.filter((l): l is AuditLog => l !== null);
}

export async function getAuditLogsByAction(action: AuditAction, limit = 50): Promise<AuditLog[]> {
  const logIds = await redis.smembers<string[]>(keys.auditLogsByAction(action));
  if (!logIds.length) return [];
  const logs = await Promise.all(logIds.map((id) => getAuditLog(id)));
  return logs
    .filter((l): l is AuditLog => l !== null)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export async function getAuditLogsByActor(actorId: string, limit = 50): Promise<AuditLog[]> {
  const logIds = await redis.zrange<string[]>(keys.auditLogsByActor(actorId), 0, limit - 1, {
    rev: true,
  });
  if (!logIds.length) return [];
  const logs = await Promise.all(logIds.map((id) => getAuditLog(id)));
  return logs.filter((l): l is AuditLog => l !== null);
}

// Helper to add audit log
export async function addAuditLog(
  action: AuditAction,
  entityType: AuditLog['entityType'],
  entityId: string,
  actor: { id: string; name: string; type: AuditLog['actorType'] },
  options?: {
    entityName?: string;
    changes?: AuditLog['changes'];
    metadata?: AuditLog['metadata'];
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const log: AuditLog = {
    id: generateId(),
    actorId: actor.id,
    actorName: actor.name,
    actorType: actor.type,
    action,
    entityType,
    entityId,
    entityName: options?.entityName,
    changes: options?.changes,
    metadata: options?.metadata,
    timestamp: new Date().toISOString(),
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  };

  await createAuditLog(log);
}
