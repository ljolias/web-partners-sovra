import { redis } from '../client';
import { keys } from '../keys';
import type { Deal, DealStage, DealStatus, DealStatusChange } from '@/types';
import { toRedisHash, generateId } from './helpers';
import { paginateZRange, type PaginationParams, type PaginatedResult } from '../pagination';

export async function getDeal(id: string): Promise<Deal | null> {
  const deal = await redis.hgetall(keys.deal(id)) as Deal | null;
  if (!deal || !deal.id) return null;
  // Parse population as number if stored as string
  if (typeof deal.population === 'string') {
    deal.population = parseInt(deal.population, 10);
  }
  // Parse boolean if stored as string
  if (typeof deal.partnerGeneratedLead === 'string') {
    deal.partnerGeneratedLead = deal.partnerGeneratedLead === 'true';
  }
  return deal;
}

/**
 * Get partner deals (legacy - not paginated)
 * @deprecated Use getPartnerDealsPaginated instead
 */
export async function getPartnerDeals(partnerId: string, limit = 50): Promise<Deal[]> {
  const result = await getPartnerDealsPaginated(partnerId, { limit });
  return result.items;
}

/**
 * Get partner deals with pagination
 */
export async function getPartnerDealsPaginated(
  partnerId: string,
  params: PaginationParams = {}
): Promise<PaginatedResult<Deal>> {
  return paginateZRange(
    keys.partnerDeals(partnerId),
    params,
    getDeal,
    { rev: true } // Newest first
  );
}

export async function createDeal(deal: Deal): Promise<void> {
  const pipeline = redis.pipeline();

  pipeline.hset(keys.deal(deal.id), toRedisHash(deal));

  // Add to partner's deals sorted by creation time
  pipeline.zadd(keys.partnerDeals(deal.partnerId), {
    score: new Date(deal.createdAt).getTime(),
    member: deal.id,
  });

  // Add to all deals index
  pipeline.zadd(keys.allDeals(), {
    score: new Date(deal.createdAt).getTime(),
    member: deal.id,
  });

  // Add to status index
  pipeline.sadd(keys.dealsByStatus(deal.status), deal.id);

  await pipeline.exec();
}

export async function updateDeal(id: string, updates: Partial<Deal>): Promise<void> {
  const deal = await getDeal(id);
  if (!deal) throw new Error('Deal not found');

  const pipeline = redis.pipeline();

  const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };

  pipeline.hset(keys.deal(id), toRedisHash(updateData as Record<string, unknown>));

  // Update status index if changed
  if (updates.status && updates.status !== deal.status) {
    pipeline.srem(keys.dealsByStatus(deal.status), id);
    pipeline.sadd(keys.dealsByStatus(updates.status), id);
  }

  await pipeline.exec();
}

export async function getDealsByStatus(status: DealStatus): Promise<Deal[]> {
  const dealIds = await redis.smembers<string[]>(keys.dealsByStatus(status));
  if (!dealIds.length) return [];
  const deals = await Promise.all(dealIds.map((id) => getDeal(id)));
  return deals.filter((d): d is Deal => d !== null);
}

export async function getAllDeals(limit = 100): Promise<Deal[]> {
  const dealIds = await redis.zrange<string[]>(keys.allDeals(), 0, limit - 1, {
    rev: true,
  });
  if (!dealIds.length) return [];
  const deals = await Promise.all(dealIds.map((id) => getDeal(id)));
  return deals.filter((d): d is Deal => d !== null);
}

// Legacy function - kept for backward compatibility
export async function checkDomainConflict(domain: string, excludeDealId?: string): Promise<string[]> {
  const existingDealIds = await redis.smembers<string[]>(keys.dealsByDomain(domain.toLowerCase()));
  if (excludeDealId) {
    return existingDealIds.filter((id) => id !== excludeDealId);
  }
  return existingDealIds;
}

export async function getDealsByStage(stage: DealStage): Promise<Deal[]> {
  const dealIds = await redis.smembers<string[]>(keys.dealsByStage(stage));
  if (!dealIds.length) return [];
  const deals = await Promise.all(dealIds.map((id) => getDeal(id)));
  return deals.filter((d): d is Deal => d !== null);
}

/**
 * Verificar si un deal tiene cotización
 */
export async function dealHasQuote(dealId: string): Promise<boolean> {
  const quoteIds = await redis.zrange<string[]>(keys.dealQuotes(dealId), 0, 0);
  return quoteIds.length > 0;
}

/**
 * Registrar cambio de estado en el historial
 */
export async function recordStatusChange(
  dealId: string,
  fromStatus: DealStatus | null,
  toStatus: DealStatus,
  changedBy: { id: string; name: string },
  options?: { notes?: string; hasQuote?: boolean }
): Promise<DealStatusChange> {
  const change: DealStatusChange = {
    id: generateId(),
    dealId,
    fromStatus,
    toStatus,
    changedBy: changedBy.id,
    changedByName: changedBy.name,
    changedAt: new Date().toISOString(),
    notes: options?.notes,
    hasQuote: options?.hasQuote || false,
  };

  const pipeline = redis.pipeline();

  // Guardar el cambio
  pipeline.hset(keys.dealStatusChange(change.id), toRedisHash(change));

  // Agregar al historial del deal (sorted by timestamp)
  pipeline.zadd(keys.dealStatusHistory(dealId), {
    score: new Date(change.changedAt).getTime(),
    member: change.id,
  });

  await pipeline.exec();
  return change;
}

/**
 * Obtener historial de cambios de estado
 */
export async function getDealStatusHistory(dealId: string): Promise<DealStatusChange[]> {
  const changeIds = await redis.zrange<string[]>(
    keys.dealStatusHistory(dealId),
    0,
    -1,
    { rev: false } // Orden cronológico
  );

  if (!changeIds.length) return [];

  const changes = await Promise.all(
    changeIds.map(async (id) => {
      const data = await redis.hgetall(keys.dealStatusChange(id));
      if (!data || !data.id) return null;

      // Convert hasQuote to boolean if stored as string
      if (typeof data.hasQuote === 'string') {
        data.hasQuote = data.hasQuote === 'true';
      }

      return data as unknown as DealStatusChange;
    })
  );

  return changes.filter((c): c is DealStatusChange => c !== null);
}

/**
 * Actualizar estado del deal con validación e historial
 */
export async function updateDealStatus(
  dealId: string,
  newStatus: DealStatus,
  changedBy: { id: string; name: string },
  options?: { notes?: string; hasQuote?: boolean }
): Promise<void> {
  const deal = await getDeal(dealId);
  if (!deal) throw new Error('Deal not found');

  const oldStatus = deal.status;

  // Registrar en historial
  await recordStatusChange(dealId, oldStatus, newStatus, changedBy, options);

  // Actualizar deal
  await updateDeal(dealId, {
    status: newStatus,
    statusChangedAt: new Date().toISOString(),
    statusChangedBy: changedBy.id,
  });
}
