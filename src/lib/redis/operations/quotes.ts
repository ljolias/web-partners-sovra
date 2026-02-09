import { redis } from '../client';
import { keys } from '../keys';
import type { Quote } from '@/types';
import { toRedisHash } from './helpers';

export async function getQuote(id: string): Promise<Quote | null> {
  const quote = await redis.hgetall(keys.quote(id)) as Quote | null;
  if (!quote || !quote.id) return null;
  // Parse JSON fields
  if (typeof quote.products === 'string') quote.products = JSON.parse(quote.products);
  if (typeof quote.services === 'string') quote.services = JSON.parse(quote.services);
  if (typeof quote.discounts === 'string') quote.discounts = JSON.parse(quote.discounts);
  // Parse numbers
  if (typeof quote.version === 'string') quote.version = parseInt(quote.version, 10);
  if (typeof quote.subtotal === 'string') quote.subtotal = parseFloat(quote.subtotal);
  if (typeof quote.totalDiscount === 'string') quote.totalDiscount = parseFloat(quote.totalDiscount);
  if (typeof quote.total === 'string') quote.total = parseFloat(quote.total);
  return quote;
}

export async function getDealQuotes(dealId: string): Promise<Quote[]> {
  const quoteIds = await redis.zrange<string[]>(keys.dealQuotes(dealId), 0, -1, {
    rev: true,
  });
  if (!quoteIds.length) return [];
  const quotes = await Promise.all(quoteIds.map((id) => getQuote(id)));
  return quotes.filter((q): q is Quote => q !== null);
}

export async function getPartnerQuotes(partnerId: string, limit = 50): Promise<Quote[]> {
  const quoteIds = await redis.zrange<string[]>(keys.partnerQuotes(partnerId), 0, limit - 1, {
    rev: true,
  });
  if (!quoteIds.length) return [];
  const quotes = await Promise.all(quoteIds.map((id) => getQuote(id)));
  return quotes.filter((q): q is Quote => q !== null);
}

export async function createQuote(quote: Quote): Promise<void> {
  const pipeline = redis.pipeline();

  const quoteData = {
    ...quote,
    products: JSON.stringify(quote.products),
    services: JSON.stringify(quote.services),
    discounts: JSON.stringify(quote.discounts),
  };

  pipeline.hset(keys.quote(quote.id), toRedisHash(quoteData));

  // Add to deal's quotes sorted by version
  pipeline.zadd(keys.dealQuotes(quote.dealId), {
    score: quote.version,
    member: quote.id,
  });

  // Add to partner's quotes sorted by creation time
  pipeline.zadd(keys.partnerQuotes(quote.partnerId), {
    score: new Date(quote.createdAt).getTime(),
    member: quote.id,
  });

  await pipeline.exec();
}

export async function updateQuote(id: string, updates: Partial<Quote>): Promise<void> {
  const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };

  // Serialize nested objects
  if (updates.products) updateData.products = JSON.stringify(updates.products);
  if (updates.services) updateData.services = JSON.stringify(updates.services);
  if (updates.discounts) updateData.discounts = JSON.stringify(updates.discounts);

  await redis.hset(keys.quote(id), toRedisHash(updateData as Record<string, unknown>));
}

export async function getNextQuoteVersion(dealId: string): Promise<number> {
  const quotes = await getDealQuotes(dealId);
  if (!quotes.length) return 1;
  return Math.max(...quotes.map(q => q.version)) + 1;
}

export async function getAllQuotes(): Promise<Quote[]> {
  // Get all quote IDs from all partners
  const allPartnerIds = await redis.zrange<string[]>('partners:all', 0, -1);
  const allQuoteIds: string[] = [];

  for (const partnerId of allPartnerIds) {
    const partnerQuoteIds = await redis.zrange<string[]>(
      keys.partnerQuotes(partnerId),
      0,
      -1
    );
    allQuoteIds.push(...partnerQuoteIds);
  }

  if (!allQuoteIds.length) return [];

  const quotes = await Promise.all(allQuoteIds.map((id) => getQuote(id)));
  return quotes.filter((q): q is Quote => q !== null);
}
