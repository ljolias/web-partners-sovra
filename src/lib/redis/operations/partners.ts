import { logger } from '@/lib/logger';
import { redis } from '../client';
import { keys, TTL } from '../keys';
import type { Partner, PartnerTier } from '@/types';
import { toRedisHash } from './helpers';
import { paginateZRange, type PaginationParams, type PaginatedResult } from '../pagination';

export async function getPartner(id: string): Promise<Partner | null> {
  const partner = await redis.hgetall(keys.partner(id)) as Partner | null;
  if (!partner || !partner.id) return null;
  // Parse numbers
  if (typeof partner.rating === 'string') partner.rating = parseFloat(partner.rating);
  if (typeof partner.totalDeals === 'string') partner.totalDeals = parseInt(partner.totalDeals, 10);
  if (typeof partner.wonDeals === 'string') partner.wonDeals = parseInt(partner.wonDeals, 10);
  if (typeof partner.totalRevenue === 'string') partner.totalRevenue = parseFloat(partner.totalRevenue);
  // Parse certifications if JSON
  if (typeof partner.certifications === 'string' && partner.certifications) {
    partner.certifications = JSON.parse(partner.certifications);
  }
  return partner;
}

export async function createPartner(partner: Partner): Promise<void> {
  const pipeline = redis.pipeline();

  const partnerData = {
    ...partner,
    certifications: partner.certifications ? JSON.stringify(partner.certifications) : '',
  };

  pipeline.hset(keys.partner(partner.id), toRedisHash(partnerData));

  // Add to tier index
  pipeline.zadd(keys.partnersByTier(partner.tier), {
    score: partner.rating,
    member: partner.id,
  });

  // Add to status index
  pipeline.sadd(keys.partnersByStatus(partner.status), partner.id);

  // Add to country index
  if (partner.country) {
    pipeline.sadd(keys.partnersByCountry(partner.country), partner.id);
  }

  // Add to all partners sorted by creation time
  pipeline.zadd(keys.allPartners(), {
    score: new Date(partner.createdAt).getTime(),
    member: partner.id,
  });

  await pipeline.exec();
}

/**
 * Get all partners (legacy - not paginated)
 * @deprecated Use getAllPartnersPaginated instead
 */
export async function getAllPartners(limit = 100): Promise<Partner[]> {
  const result = await getAllPartnersPaginated({ limit });
  return result.items;
}

/**
 * Get all partners with pagination
 */
export async function getAllPartnersPaginated(
  params: PaginationParams = {}
): Promise<PaginatedResult<Partner>> {
  return paginateZRange(
    keys.allPartners(),
    params,
    getPartner,
    { rev: true } // Newest first
  );
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
  const currentPartner = await getPartner(id);
  if (!currentPartner) {
    throw new Error(`Partner ${id} not found`);
  }

  const pipeline = redis.pipeline();

  // Handle certifications serialization
  const updateData = {
    ...updates,
    certifications: updates.certifications ? JSON.stringify(updates.certifications) : undefined,
  };

  pipeline.hset(keys.partner(id), toRedisHash(updateData as Record<string, string | number | boolean>));

  // Update tier index if tier changed
  if (updates.tier && updates.tier !== currentPartner.tier) {
    pipeline.zrem(keys.partnersByTier(currentPartner.tier), id);
    pipeline.zadd(keys.partnersByTier(updates.tier), {
      score: updates.rating ?? currentPartner.rating,
      member: id,
    });
  } else if (updates.rating !== undefined) {
    // Update rating in current tier
    pipeline.zadd(keys.partnersByTier(currentPartner.tier), {
      score: updates.rating,
      member: id,
    });
  }

  // Update status index if status changed
  if (updates.status && updates.status !== currentPartner.status) {
    pipeline.srem(keys.partnersByStatus(currentPartner.status), id);
    pipeline.sadd(keys.partnersByStatus(updates.status), id);
  }

  // Update country index if country changed
  if (updates.country && updates.country !== currentPartner.country) {
    if (currentPartner.country) {
      pipeline.srem(keys.partnersByCountry(currentPartner.country), id);
    }
    pipeline.sadd(keys.partnersByCountry(updates.country), id);
  }

  await pipeline.exec();
}

export async function getPartnersByTier(tier: PartnerTier, limit = 100): Promise<Partner[]> {
  const partnerIds = await redis.zrange<string[]>(keys.partnersByTier(tier), 0, limit - 1, {
    rev: true, // Highest rating first
  });

  const partnerPromises = partnerIds.map((id) => getPartner(id));
  const partners = await Promise.all(partnerPromises);
  return partners.filter((p): p is Partner => p !== null);
}

export async function getPartnersByStatus(status: string, limit = 100): Promise<Partner[]> {
  const partnerIds = await redis.smembers(keys.partnersByStatus(status));

  const limitedIds = partnerIds.slice(0, limit);
  const partnerPromises = limitedIds.map((id) => getPartner(id));
  const partners = await Promise.all(partnerPromises);
  return partners.filter((p): p is Partner => p !== null);
}

export async function getPartnersByCountry(country: string, limit = 100): Promise<Partner[]> {
  const partnerIds = await redis.smembers(keys.partnersByCountry(country));

  const limitedIds = partnerIds.slice(0, limit);
  const partnerPromises = limitedIds.map((id) => getPartner(id));
  const partners = await Promise.all(partnerPromises);
  return partners.filter((p): p is Partner => p !== null);
}

export async function searchPartners(query: string, limit = 10): Promise<Partner[]> {
  const allPartners = await getAllPartners(1000);
  const lowerQuery = query.toLowerCase();

  return allPartners
    .filter((partner) => {
      const searchableText = [
        partner.companyName,
        partner.contactName,
        partner.contactEmail,
        partner.country,
        // Legacy fields
        partner.name,
        partner.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(lowerQuery);
    })
    .slice(0, limit);
}

export async function deletePartner(id: string): Promise<void> {
  const partner = await getPartner(id);
  if (!partner) return;

  const pipeline = redis.pipeline();

  // Delete partner data
  pipeline.del(keys.partner(id));

  // Remove from tier index
  pipeline.zrem(keys.partnersByTier(partner.tier), id);

  // Remove from status index
  pipeline.srem(keys.partnersByStatus(partner.status), id);

  // Remove from country index
  if (partner.country) {
    pipeline.srem(keys.partnersByCountry(partner.country), id);
  }

  // Remove from all partners index
  pipeline.zrem(keys.allPartners(), id);

  await pipeline.exec();
}

export async function suspendPartner(
  id: string,
  suspendedBy: string,
  reason: string
): Promise<void> {
  await updatePartner(id, {
    status: 'suspended',
    suspendedAt: new Date().toISOString(),
    suspendedBy,
    suspendedReason: reason,
  });
}

export async function reactivatePartner(id: string): Promise<void> {
  const partner = await getPartner(id);
  if (!partner) throw new Error('Partner not found');

  const pipeline = redis.pipeline();

  // Clear suspension fields and set active
  pipeline.hset(keys.partner(id), toRedisHash({
    status: 'active',
    suspendedAt: '',
    suspendedBy: '',
    suspendedReason: '',
    updatedAt: new Date().toISOString(),
  }));

  // Update status index
  pipeline.srem(keys.partnersByStatus('suspended'), id);
  pipeline.sadd(keys.partnersByStatus('active'), id);

  await pipeline.exec();
}

export async function getPartnerStats(partnerId: string): Promise<{
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  pendingDeals: number;
  totalRevenue: number;
  credentialsCount: number;
  activeCredentials: number;
}> {
  // Import dependencies at runtime to avoid circular deps
  const { getPartnerDeals } = require('./deals');
  const { getPartnerCredentials } = require('./credentials');

  const [deals, credentials] = await Promise.all([
    getPartnerDeals(partnerId),
    getPartnerCredentials(partnerId),
  ]);

  const wonDeals = deals.filter((d: any) => d.status === 'closed_won').length;
  const lostDeals = deals.filter((d: any) => d.status === 'closed_lost').length;
  const pendingDeals = deals.filter((d: any) => !['closed_won', 'closed_lost', 'rejected'].includes(d.status)).length;

  return {
    totalDeals: deals.length,
    wonDeals,
    lostDeals,
    pendingDeals,
    totalRevenue: 0, // Would need quote data to calculate
    credentialsCount: credentials.length,
    activeCredentials: credentials.filter((c: any) => c.status === 'active').length,
  };
}
