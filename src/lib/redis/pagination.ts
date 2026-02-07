/**
 * Redis Pagination Utilities
 *
 * Provides helpers for paginating large Redis datasets efficiently
 */

import { redis } from './client';

export interface PaginationParams {
  cursor?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: number | null;
  hasMore: boolean;
  total?: number;
}

/**
 * Default pagination limit
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Paginate a Redis sorted set (ZSET) using range queries
 *
 * @param key - Redis key for the sorted set
 * @param params - Pagination parameters
 * @param mapper - Function to map IDs to full objects
 * @param options - Additional options (reverse order, etc.)
 */
export async function paginateZRange<T>(
  key: string,
  params: PaginationParams,
  mapper: (id: string) => Promise<T | null>,
  options: { rev?: boolean } = {}
): Promise<PaginatedResult<T>> {
  const cursor = params.cursor || 0;
  const limit = Math.min(params.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const end = cursor + limit - 1;

  // Fetch IDs from sorted set
  const ids = await redis.zrange<string[]>(key, cursor, end, {
    rev: options.rev !== false, // Default to reverse (newest first)
  });

  // Map IDs to full objects
  const items = await Promise.all(ids.map(mapper));
  const filtered = items.filter((item): item is Awaited<T> => item !== null) as T[];

  // Check if there are more items
  const hasMore = ids.length === limit;
  const nextCursor = hasMore ? cursor + limit : null;

  return {
    items: filtered,
    nextCursor,
    hasMore,
  };
}

/**
 * Paginate a Redis set (SSET) using SSCAN
 *
 * @param key - Redis key for the set
 * @param params - Pagination parameters
 * @param mapper - Function to map IDs to full objects
 */
export async function paginateSet<T>(
  key: string,
  params: PaginationParams,
  mapper: (id: string) => Promise<T | null>
): Promise<PaginatedResult<T>> {
  const limit = Math.min(params.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const cursor = params.cursor?.toString() || '0';

  // Use SSCAN to iterate through set
  const [nextCursor, ids] = await redis.sscan(key, cursor, {
    count: limit,
  });

  // Map IDs to full objects
  const items = await Promise.all((ids as string[]).map(mapper));
  const filtered = items.filter((item): item is Awaited<T> => item !== null) as T[];

  const hasMore = nextCursor !== '0';

  return {
    items: filtered,
    nextCursor: hasMore ? parseInt(nextCursor) : null,
    hasMore,
  };
}

/**
 * Get total count from a sorted set
 */
export async function getZSetTotal(key: string): Promise<number> {
  return await redis.zcard(key);
}

/**
 * Get total count from a set
 */
export async function getSetTotal(key: string): Promise<number> {
  return await redis.scard(key);
}

/**
 * Helper to create pagination response with metadata
 */
export function createPaginatedResponse<T>(
  result: PaginatedResult<T>,
  totalCount?: number
) {
  return {
    data: result.items,
    pagination: {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      total: totalCount,
      count: result.items.length,
    },
  };
}
