import { redis } from './client';
import { keys, TTL } from './keys';
import type {
  Partner,
  PartnerTier,
  PartnerCredential,
  CredentialStatus,
  User,
  Session,
  Deal,
  DealStage,
  DealStatus,
  Quote,
  PricingConfig,
  TrainingModule,
  TrainingProgress,
  TrainingCourse,
  Certification,
  LegalDocument,
  LegalSignature,
  CopilotSession,
  CopilotMessage,
  Commission,
  MEDDICScores,
  DocumentCategory,
  DocumentStatus,
  DocumentAuditEvent,
  LegacyLegalDocument,
  AuditLog,
  AuditAction,
} from '@/types';

// Helper to convert objects to Redis-compatible format
function toRedisHash<T extends object>(obj: T): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      result[key] = '';
    } else if (typeof value === 'object') {
      result[key] = JSON.stringify(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============ Partner Operations ============

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

export async function getAllPartners(limit = 100): Promise<Partner[]> {
  // First try the allPartners index
  let partnerIds = await redis.zrange<string[]>(keys.allPartners(), 0, limit - 1, { rev: true });

  // If empty, scan for partner keys (for existing data)
  if (!partnerIds.length) {
    const partnerKeys = await redis.keys('partner:*');
    partnerIds = partnerKeys
      .filter(k => !k.includes(':') || k.split(':').length === 2) // Only partner:{id} keys
      .filter(k => !k.includes('users') && !k.includes('deals') && !k.includes('legal'))
      .map(k => k.replace('partner:', ''));
  }

  if (!partnerIds.length) return [];

  const partners = await Promise.all(partnerIds.map(id => getPartner(id)));
  return partners.filter((p): p is Partner => p !== null);
}

export async function getPartnersByStatus(status: 'active' | 'suspended'): Promise<Partner[]> {
  const partnerIds = await redis.smembers<string[]>(keys.partnersByStatus(status));
  if (!partnerIds.length) return [];
  const partners = await Promise.all(partnerIds.map(id => getPartner(id)));
  return partners.filter((p): p is Partner => p !== null);
}

export async function getPartnersByTier(tier: PartnerTier): Promise<Partner[]> {
  const partnerIds = await redis.zrange<string[]>(keys.partnersByTier(tier), 0, -1);
  if (!partnerIds.length) return [];
  const partners = await Promise.all(partnerIds.map(id => getPartner(id)));
  return partners.filter((p): p is Partner => p !== null);
}

export async function getPartnersByCountry(country: string): Promise<Partner[]> {
  const partnerIds = await redis.smembers<string[]>(keys.partnersByCountry(country));
  if (!partnerIds.length) return [];
  const partners = await Promise.all(partnerIds.map(id => getPartner(id)));
  return partners.filter((p): p is Partner => p !== null);
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
  const partner = await getPartner(id);
  if (!partner) throw new Error('Partner not found');

  const pipeline = redis.pipeline();

  const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };
  if (updates.certifications) updateData.certifications = JSON.stringify(updates.certifications);

  pipeline.hset(keys.partner(id), toRedisHash(updateData as Record<string, unknown>));

  // Update tier index if changed
  if (updates.tier && updates.tier !== partner.tier) {
    pipeline.zrem(keys.partnersByTier(partner.tier), id);
    pipeline.zadd(keys.partnersByTier(updates.tier), {
      score: updates.rating ?? partner.rating,
      member: id,
    });
  }

  // Update status index if changed
  if (updates.status && updates.status !== partner.status) {
    pipeline.srem(keys.partnersByStatus(partner.status), id);
    pipeline.sadd(keys.partnersByStatus(updates.status), id);
  }

  // Update country index if changed
  if (updates.country && updates.country !== partner.country) {
    if (partner.country) {
      pipeline.srem(keys.partnersByCountry(partner.country), id);
    }
    pipeline.sadd(keys.partnersByCountry(updates.country), id);
  }

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

export async function deletePartner(id: string): Promise<void> {
  const partner = await getPartner(id);
  if (!partner) throw new Error('Partner not found');

  const pipeline = redis.pipeline();

  // Delete partner hash
  pipeline.del(keys.partner(id));

  // Remove from all indexes
  pipeline.zrem(keys.allPartners(), id);
  pipeline.zrem(keys.partnersByTier(partner.tier), id);
  pipeline.srem(keys.partnersByStatus(partner.status), id);
  if (partner.country) {
    pipeline.srem(keys.partnersByCountry(partner.country), id);
  }

  // Get and delete all partner deals
  const dealIds = await redis.zrange<string[]>(keys.partnerDeals(id), 0, -1);
  for (const dealId of dealIds) {
    pipeline.del(`deal:${dealId}`);
    pipeline.zrem(keys.allDeals(), dealId);
  }
  pipeline.del(keys.partnerDeals(id));

  // Get and delete all partner credentials
  const credentialIds = await redis.smembers<string[]>(keys.partnerCredentials(id));
  for (const credId of credentialIds) {
    pipeline.del(keys.partnerCredential(credId));
  }
  pipeline.del(keys.partnerCredentials(id));

  // Delete partner users
  const userIds = await redis.smembers<string[]>(keys.partnerUsers(id));
  for (const userId of userIds) {
    const user = await redis.hgetall(`user:${userId}`) as { email?: string } | null;
    if (user?.email) {
      pipeline.del(`user:email:${user.email}`);
    }
    pipeline.del(`user:${userId}`);
  }
  pipeline.del(keys.partnerUsers(id));

  // Delete partner legal documents
  pipeline.del(`partner:${id}:legal:documents`);
  pipeline.del(`partner:${id}:signatures`);

  // Delete partner certifications
  pipeline.del(`partner:${id}:certifications`);

  // Delete partner commissions
  pipeline.del(`partner:${id}:commissions`);

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
  const [deals, credentials] = await Promise.all([
    getPartnerDeals(partnerId),
    getPartnerCredentials(partnerId),
  ]);

  const wonDeals = deals.filter(d => d.status === 'closed_won').length;
  const lostDeals = deals.filter(d => d.status === 'closed_lost').length;
  const pendingDeals = deals.filter(d => !['closed_won', 'closed_lost', 'rejected'].includes(d.status)).length;

  return {
    totalDeals: deals.length,
    wonDeals,
    lostDeals,
    pendingDeals,
    totalRevenue: 0, // Would need quote data to calculate
    credentialsCount: credentials.length,
    activeCredentials: credentials.filter(c => c.status === 'active').length,
  };
}

// ============ User Operations ============

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

// ============ Session Operations ============

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

// ============ Deal Operations ============

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

export async function getPartnerDeals(partnerId: string, limit = 50): Promise<Deal[]> {
  const dealIds = await redis.zrange<string[]>(keys.partnerDeals(partnerId), 0, limit - 1, {
    rev: true,
  });
  if (!dealIds.length) return [];

  const deals = await Promise.all(dealIds.map((id) => getDeal(id)));
  return deals.filter((d): d is Deal => d !== null);
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

// ============ Training Operations ============

export async function getTrainingModule(id: string): Promise<TrainingModule | null> {
  const module = await redis.hgetall(keys.trainingModule(id)) as TrainingModule | null;
  if (!module || !module.id) return null;
  // Parse JSON fields
  if (typeof module.title === 'string') module.title = JSON.parse(module.title);
  if (typeof module.description === 'string') module.description = JSON.parse(module.description);
  if (typeof module.content === 'string') module.content = JSON.parse(module.content);
  if (typeof module.quiz === 'string') module.quiz = JSON.parse(module.quiz);
  return module;
}

export async function getAllTrainingModules(): Promise<TrainingModule[]> {
  const moduleIds = await redis.smembers<string[]>(keys.trainingModules());
  if (!moduleIds.length) return [];
  const modules = await Promise.all(moduleIds.map((id) => getTrainingModule(id)));
  return modules.filter((m): m is TrainingModule => m !== null).sort((a, b) => a.order - b.order);
}

export async function createTrainingModule(module: TrainingModule): Promise<void> {
  const moduleData = {
    ...module,
    title: JSON.stringify(module.title),
    description: JSON.stringify(module.description),
    content: JSON.stringify(module.content),
    quiz: JSON.stringify(module.quiz),
  };

  const pipeline = redis.pipeline();
  pipeline.hset(keys.trainingModule(module.id), toRedisHash(moduleData));
  pipeline.sadd(keys.trainingModules(), module.id);
  await pipeline.exec();
}

export async function getUserTrainingProgress(userId: string): Promise<Record<string, TrainingProgress>> {
  const progress = await redis.hgetall(keys.userTrainingProgress(userId)) as Record<string, string> | null;
  if (!progress) return {};

  const parsed: Record<string, TrainingProgress> = {};
  for (const [moduleId, data] of Object.entries(progress)) {
    parsed[moduleId] = typeof data === 'string' ? JSON.parse(data) : data;
  }
  return parsed;
}

export async function updateTrainingProgress(userId: string, progress: TrainingProgress): Promise<void> {
  await redis.hset(keys.userTrainingProgress(userId), {
    [progress.moduleId]: JSON.stringify(progress),
  });
}

// ============ Certification Operations ============

export async function getCertification(id: string): Promise<Certification | null> {
  const cert = await redis.hgetall(keys.certification(id)) as Certification | null;
  if (!cert || !cert.id) return null;
  return cert;
}

export async function getUserCertifications(userId: string): Promise<Certification[]> {
  const certIds = await redis.smembers<string[]>(keys.userCertifications(userId));
  if (!certIds.length) return [];
  const certs = await Promise.all(certIds.map((id) => getCertification(id)));
  return certs.filter((c): c is Certification => c !== null);
}

export async function createCertification(cert: Certification): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.hset(keys.certification(cert.id), toRedisHash(cert));
  pipeline.sadd(keys.userCertifications(cert.userId), cert.id);
  pipeline.sadd(keys.partnerCertifications(cert.partnerId), cert.id);
  await pipeline.exec();
}

export async function hasValidCertification(userId: string): Promise<boolean> {
  const certs = await getUserCertifications(userId);
  return certs.some(
    (cert) => cert.status === 'active' && new Date(cert.expiresAt) > new Date()
  );
}

// ============ Legal Operations (Legacy) ============

export async function getLegalDocument(id: string): Promise<LegacyLegalDocument | null> {
  const doc = await redis.hgetall(keys.legalDocument(id)) as LegacyLegalDocument | null;
  if (!doc || !doc.id) return null;
  if (typeof doc.title === 'string') doc.title = JSON.parse(doc.title);
  if (typeof doc.content === 'string') doc.content = JSON.parse(doc.content);
  return doc;
}

export async function getAllLegalDocuments(): Promise<LegacyLegalDocument[]> {
  const docIds = await redis.smembers<string[]>(keys.legalDocuments());
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocument(id)));
  return docs.filter((d): d is LegacyLegalDocument => d !== null);
}

export async function createLegalDocument(doc: LegacyLegalDocument): Promise<void> {
  const docData = {
    ...doc,
    title: JSON.stringify(doc.title),
    content: JSON.stringify(doc.content),
  };

  const pipeline = redis.pipeline();
  pipeline.hset(keys.legalDocument(doc.id), toRedisHash(docData));
  pipeline.sadd(keys.legalDocuments(), doc.id);
  await pipeline.exec();
}

export async function signLegalDocument(signature: LegalSignature): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.hset(keys.legalSignature(signature.id), toRedisHash(signature));
  pipeline.sadd(keys.userSignatures(signature.userId), signature.id);
  pipeline.sadd(keys.partnerSignatures(signature.partnerId), signature.id);
  await pipeline.exec();
}

export async function getUserSignatures(userId: string): Promise<LegalSignature[]> {
  const sigIds = await redis.smembers<string[]>(keys.userSignatures(userId));
  if (!sigIds.length) return [];
  const sigs = await Promise.all(
    sigIds.map((id) => redis.hgetall(keys.legalSignature(id)) as Promise<LegalSignature | null>)
  );
  return sigs.filter((s): s is LegalSignature => s !== null && !!s.id);
}

export async function hasSignedRequiredDocs(userId: string): Promise<boolean> {
  const [docs, signatures] = await Promise.all([
    getAllLegalDocuments(),
    getUserSignatures(userId),
  ]);

  const requiredDocs = docs.filter((d) => d.requiredForDeals);
  const signedDocIds = new Set(signatures.map((s) => s.documentId));

  return requiredDocs.every((doc) => signedDocIds.has(doc.id));
}

// ============ Copilot Operations ============

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

// ============ Commission Operations ============

export async function getCommission(id: string): Promise<Commission | null> {
  const commission = await redis.hgetall(keys.commission(id)) as Commission | null;
  if (!commission || !commission.id) return null;
  return commission;
}

export async function getPartnerCommissions(partnerId: string): Promise<Commission[]> {
  const commIds = await redis.smembers<string[]>(keys.partnerCommissions(partnerId));
  if (!commIds.length) return [];
  const comms = await Promise.all(commIds.map((id) => getCommission(id)));
  return comms.filter((c): c is Commission => c !== null);
}

export async function createCommission(commission: Commission): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.hset(keys.commission(commission.id), toRedisHash(commission));
  pipeline.sadd(keys.partnerCommissions(commission.partnerId), commission.id);
  pipeline.set(keys.dealCommission(commission.dealId), commission.id);
  await pipeline.exec();
}

export async function updateCommission(id: string, updates: Partial<Commission>): Promise<void> {
  await redis.hset(keys.commission(id), toRedisHash(updates as Record<string, unknown>));
}

// ============ Quote Operations ============

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

// ============ Pricing Config Operations ============

const DEFAULT_PRICING_CONFIG: PricingConfig = {
  sovraGov: {
    tiers: [
      { maxPopulation: 100000, pricePerInhabitant: 0.50 },
      { maxPopulation: 250000, pricePerInhabitant: 0.40 },
      { maxPopulation: 500000, pricePerInhabitant: 0.32 },
      { maxPopulation: 1000000, pricePerInhabitant: 0.26 },
      { maxPopulation: 2500000, pricePerInhabitant: 0.20 },
      { maxPopulation: 5000000, pricePerInhabitant: 0.16 },
      { maxPopulation: 10000000, pricePerInhabitant: 0.13 },
    ],
  },
  sovraId: {
    essentials: { monthlyLimit: 10000, monthlyPrice: 1000 },
    professional: { monthlyLimit: 30000, monthlyPrice: 2000 },
    enterprise: { monthlyLimit: 50000, monthlyPrice: 3000 },
  },
  services: {
    walletImplementation: 5000,
    integrationHourlyRate: 150,
  },
  discounts: {
    bronze: { base: 5, leadBonus: 0 },
    silver: { base: 20, leadBonus: 10 },
    gold: { base: 25, leadBonus: 15 },
    platinum: { base: 30, leadBonus: 20 },
  },
};

export async function getPricingConfig(): Promise<PricingConfig> {
  const config = await redis.get<string>(keys.pricingConfig());
  if (!config) {
    // Initialize with default config
    await savePricingConfig(DEFAULT_PRICING_CONFIG);
    return DEFAULT_PRICING_CONFIG;
  }
  return typeof config === 'string' ? JSON.parse(config) : config;
}

export async function savePricingConfig(config: PricingConfig): Promise<void> {
  await redis.set(keys.pricingConfig(), JSON.stringify(config));
}

export async function updatePricingConfig(updates: Partial<PricingConfig>): Promise<PricingConfig> {
  const current = await getPricingConfig();
  const updated = { ...current, ...updates };
  await savePricingConfig(updated);
  return updated;
}

export { DEFAULT_PRICING_CONFIG };

// ============ Enhanced Legal Document Operations (V2) ============

export async function getLegalDocumentV2(id: string): Promise<LegalDocument | null> {
  const doc = await redis.hgetall(keys.legalDocumentV2(id)) as LegalDocument | null;
  if (!doc || !doc.id) return null;
  // Parse JSON fields (handle empty strings)
  if (typeof doc.docusignMetadata === 'string' && doc.docusignMetadata) {
    doc.docusignMetadata = JSON.parse(doc.docusignMetadata);
  } else {
    doc.docusignMetadata = undefined;
  }
  if (typeof doc.uploadMetadata === 'string' && doc.uploadMetadata) {
    doc.uploadMetadata = JSON.parse(doc.uploadMetadata);
  } else {
    doc.uploadMetadata = undefined;
  }
  // Parse numbers
  if (typeof doc.version === 'string') doc.version = parseInt(doc.version, 10);
  return doc;
}

export async function getPartnerLegalDocuments(partnerId: string, limit = 100): Promise<LegalDocument[]> {
  console.log('[Redis] Fetching documents for partner:', partnerId, 'key:', keys.partnerLegalDocuments(partnerId));
  const docIds = await redis.zrange<string[]>(keys.partnerLegalDocuments(partnerId), 0, limit - 1, {
    rev: true,
  });
  console.log('[Redis] Found document IDs:', docIds.length, docIds);
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocumentV2(id)));
  return docs.filter((d): d is LegalDocument => d !== null);
}

export async function getAllLegalDocumentsV2(limit = 100): Promise<LegalDocument[]> {
  const docIds = await redis.zrange<string[]>(keys.allLegalDocumentsV2(), 0, limit - 1, {
    rev: true,
  });
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocumentV2(id)));
  return docs.filter((d): d is LegalDocument => d !== null);
}

export async function getLegalDocumentsByCategory(category: DocumentCategory, limit = 100): Promise<LegalDocument[]> {
  const docIds = await redis.smembers<string[]>(keys.legalDocumentsByCategory(category));
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocumentV2(id)));
  return docs.filter((d): d is LegalDocument => d !== null).slice(0, limit);
}

export async function getLegalDocumentsByStatus(status: DocumentStatus, limit = 100): Promise<LegalDocument[]> {
  const docIds = await redis.smembers<string[]>(keys.legalDocumentsByStatus(status));
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocumentV2(id)));
  return docs.filter((d): d is LegalDocument => d !== null).slice(0, limit);
}

export async function createLegalDocumentV2(doc: LegalDocument): Promise<void> {
  console.log('[Redis] Creating legal document:', doc.id, 'for partner:', doc.partnerId);

  const pipeline = redis.pipeline();

  const docData = {
    ...doc,
    docusignMetadata: doc.docusignMetadata ? JSON.stringify(doc.docusignMetadata) : '',
    uploadMetadata: doc.uploadMetadata ? JSON.stringify(doc.uploadMetadata) : '',
  };

  pipeline.hset(keys.legalDocumentV2(doc.id), toRedisHash(docData));

  // Add to partner's documents sorted by creation time
  pipeline.zadd(keys.partnerLegalDocuments(doc.partnerId), {
    score: new Date(doc.createdAt).getTime(),
    member: doc.id,
  });

  // Add to all documents index
  pipeline.zadd(keys.allLegalDocumentsV2(), {
    score: new Date(doc.createdAt).getTime(),
    member: doc.id,
  });

  // Add to category index
  pipeline.sadd(keys.legalDocumentsByCategory(doc.category), doc.id);

  // Add to status index
  pipeline.sadd(keys.legalDocumentsByStatus(doc.status), doc.id);

  // If DocuSign document, create envelope mapping
  if (doc.type === 'docusign' && doc.docusignMetadata?.envelopeId) {
    pipeline.set(keys.docusignEnvelope(doc.docusignMetadata.envelopeId), doc.id);
  }

  await pipeline.exec();
}

export async function updateLegalDocumentV2(id: string, updates: Partial<LegalDocument>): Promise<void> {
  const doc = await getLegalDocumentV2(id);
  if (!doc) throw new Error('Document not found');

  const pipeline = redis.pipeline();

  const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };

  // Serialize nested objects
  if (updates.docusignMetadata) updateData.docusignMetadata = JSON.stringify(updates.docusignMetadata);
  if (updates.uploadMetadata) updateData.uploadMetadata = JSON.stringify(updates.uploadMetadata);

  pipeline.hset(keys.legalDocumentV2(id), toRedisHash(updateData as Record<string, unknown>));

  // Update status index if changed
  if (updates.status && updates.status !== doc.status) {
    pipeline.srem(keys.legalDocumentsByStatus(doc.status), id);
    pipeline.sadd(keys.legalDocumentsByStatus(updates.status), id);
  }

  // Update category index if changed
  if (updates.category && updates.category !== doc.category) {
    pipeline.srem(keys.legalDocumentsByCategory(doc.category), id);
    pipeline.sadd(keys.legalDocumentsByCategory(updates.category), id);
  }

  await pipeline.exec();
}

export async function getLegalDocumentByEnvelopeId(envelopeId: string): Promise<LegalDocument | null> {
  const docId = await redis.get<string>(keys.docusignEnvelope(envelopeId));
  if (!docId) return null;
  return getLegalDocumentV2(docId);
}

// ============ Document Audit Operations ============

export async function createDocumentAuditEvent(event: DocumentAuditEvent): Promise<void> {
  const pipeline = redis.pipeline();

  pipeline.hset(keys.documentAuditEvent(event.id), toRedisHash(event));
  pipeline.zadd(keys.documentAuditEvents(event.documentId), {
    score: new Date(event.timestamp).getTime(),
    member: event.id,
  });

  await pipeline.exec();
}

export async function getDocumentAuditEvents(documentId: string, limit = 50): Promise<DocumentAuditEvent[]> {
  const eventIds = await redis.zrange<string[]>(keys.documentAuditEvents(documentId), 0, limit - 1, {
    rev: true,
  });
  if (!eventIds.length) return [];

  const events = await Promise.all(
    eventIds.map(async (id) => {
      const event = await redis.hgetall(keys.documentAuditEvent(id)) as DocumentAuditEvent | null;
      if (!event || !event.id) return null;
      if (typeof event.details === 'string') event.details = JSON.parse(event.details);
      return event;
    })
  );

  return events.filter((e): e is DocumentAuditEvent => e !== null);
}

export async function addDocumentAuditLog(
  documentId: string,
  action: DocumentAuditEvent['action'],
  actor: { type: 'partner' | 'sovra' | 'system'; id?: string; name?: string },
  details?: Record<string, unknown>,
  request?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  const event: DocumentAuditEvent = {
    id: generateId(),
    documentId,
    action,
    actorType: actor.type,
    actorId: actor.id,
    actorName: actor.name,
    details,
    ipAddress: request?.ipAddress,
    userAgent: request?.userAgent,
    timestamp: new Date().toISOString(),
  };

  await createDocumentAuditEvent(event);
}

// ============ Partner Pending Documents ============

export async function getPartnerPendingDocuments(partnerId: string): Promise<LegalDocument[]> {
  const docs = await getPartnerLegalDocuments(partnerId);
  return docs.filter(
    (doc) =>
      doc.status === 'pending_signature' ||
      (doc.type === 'upload' &&
        doc.uploadMetadata?.verificationStatus === 'pending' &&
        doc.uploadMetadata?.uploadedBy === 'partner')
  );
}

export async function getPartnerDocumentsRequiringAction(partnerId: string): Promise<{
  pendingSignature: LegalDocument[];
  expiringSOon: LegalDocument[];
}> {
  const docs = await getPartnerLegalDocuments(partnerId);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const pendingSignature = docs.filter(
    (doc) => doc.status === 'pending_signature' || doc.status === 'partially_signed'
  );

  const expiringSOon = docs.filter((doc) => {
    if (!doc.expirationDate || doc.status !== 'active') return false;
    const expDate = new Date(doc.expirationDate);
    return expDate > now && expDate <= thirtyDaysFromNow;
  });

  return { pendingSignature, expiringSOon };
}

// ============ Partner Credentials (SovraID) Operations ============

export async function getPartnerCredential(id: string): Promise<PartnerCredential | null> {
  const credential = await redis.hgetall(keys.partnerCredential(id)) as PartnerCredential | null;
  if (!credential || !credential.id) return null;
  return credential;
}

export async function getPartnerCredentials(partnerId: string, limit = 100): Promise<PartnerCredential[]> {
  const credentialIds = await redis.zrange<string[]>(keys.partnerCredentials(partnerId), 0, limit - 1, {
    rev: true,
  });
  if (!credentialIds.length) return [];
  const credentials = await Promise.all(credentialIds.map((id) => getPartnerCredential(id)));
  return credentials.filter((c): c is PartnerCredential => c !== null);
}

export async function getCredentialsByStatus(status: CredentialStatus): Promise<PartnerCredential[]> {
  const credentialIds = await redis.smembers<string[]>(keys.credentialsByStatus(status));
  if (!credentialIds.length) return [];
  const credentials = await Promise.all(credentialIds.map((id) => getPartnerCredential(id)));
  return credentials.filter((c): c is PartnerCredential => c !== null);
}

export async function getCredentialByEmail(email: string): Promise<PartnerCredential | null> {
  const credentialId = await redis.get<string>(keys.credentialByEmail(email));
  if (!credentialId) return null;
  return getPartnerCredential(credentialId);
}

export async function createPartnerCredential(credential: PartnerCredential): Promise<void> {
  const pipeline = redis.pipeline();

  pipeline.hset(keys.partnerCredential(credential.id), toRedisHash(credential));

  // Add to partner's credentials sorted by creation time
  pipeline.zadd(keys.partnerCredentials(credential.partnerId), {
    score: new Date(credential.createdAt).getTime(),
    member: credential.id,
  });

  // Add to all credentials index
  pipeline.zadd(keys.allCredentials(), {
    score: new Date(credential.createdAt).getTime(),
    member: credential.id,
  });

  // Add to status index
  pipeline.sadd(keys.credentialsByStatus(credential.status), credential.id);

  // Add email index
  pipeline.set(keys.credentialByEmail(credential.holderEmail), credential.id);

  await pipeline.exec();
}

export async function updatePartnerCredential(id: string, updates: Partial<PartnerCredential>): Promise<void> {
  const credential = await getPartnerCredential(id);
  if (!credential) throw new Error('Credential not found');

  const pipeline = redis.pipeline();

  const updateData = { ...updates, updatedAt: new Date().toISOString() };
  pipeline.hset(keys.partnerCredential(id), toRedisHash(updateData as Record<string, unknown>));

  // Update status index if changed
  if (updates.status && updates.status !== credential.status) {
    pipeline.srem(keys.credentialsByStatus(credential.status), id);
    pipeline.sadd(keys.credentialsByStatus(updates.status), id);
  }

  await pipeline.exec();
}

export async function revokePartnerCredential(
  id: string,
  revokedBy: string,
  reason: string
): Promise<void> {
  await updatePartnerCredential(id, {
    status: 'revoked',
    revokedAt: new Date().toISOString(),
    revokedBy,
    revokedReason: reason,
  });
}

export async function revokeAllPartnerCredentials(
  partnerId: string,
  revokedBy: string,
  reason: string
): Promise<void> {
  const credentials = await getPartnerCredentials(partnerId);
  const activeCredentials = credentials.filter(c => ['active', 'claimed', 'issued'].includes(c.status));

  for (const credential of activeCredentials) {
    await revokePartnerCredential(credential.id, revokedBy, reason);
  }
}

// ============ Training Courses (Admin) Operations ============

export async function getTrainingCourse(id: string): Promise<TrainingCourse | null> {
  const course = await redis.hgetall(keys.trainingCourse(id)) as TrainingCourse | null;
  if (!course || !course.id) return null;
  // Parse JSON fields
  if (typeof course.title === 'string') course.title = JSON.parse(course.title);
  if (typeof course.description === 'string') course.description = JSON.parse(course.description);
  if (typeof course.modules === 'string') course.modules = JSON.parse(course.modules);
  if (typeof course.requiredForTiers === 'string' && course.requiredForTiers) {
    course.requiredForTiers = JSON.parse(course.requiredForTiers as unknown as string);
  }
  // Parse booleans
  if (typeof course.isPublished === 'string') course.isPublished = course.isPublished === 'true';
  if (typeof course.isRequired === 'string') course.isRequired = course.isRequired === 'true';
  if (typeof course.certificateEnabled === 'string') course.certificateEnabled = course.certificateEnabled === 'true';
  // Parse numbers
  if (typeof course.duration === 'string') course.duration = parseInt(course.duration, 10);
  if (typeof course.passingScore === 'string') course.passingScore = parseInt(course.passingScore, 10);
  if (typeof course.order === 'string') course.order = parseInt(course.order, 10);
  return course;
}

export async function getAllTrainingCourses(): Promise<TrainingCourse[]> {
  const courseIds = await redis.zrange<string[]>(keys.allTrainingCourses(), 0, -1, { rev: true });
  if (!courseIds.length) return [];
  const courses = await Promise.all(courseIds.map((id) => getTrainingCourse(id)));
  return courses.filter((c): c is TrainingCourse => c !== null).sort((a, b) => a.order - b.order);
}

export async function getPublishedTrainingCourses(): Promise<TrainingCourse[]> {
  const courseIds = await redis.smembers<string[]>(keys.publishedTrainingCourses());
  if (!courseIds.length) return [];
  const courses = await Promise.all(courseIds.map((id) => getTrainingCourse(id)));
  return courses.filter((c): c is TrainingCourse => c !== null).sort((a, b) => a.order - b.order);
}

export async function getTrainingCoursesByCategory(category: string): Promise<TrainingCourse[]> {
  const courseIds = await redis.smembers<string[]>(keys.trainingCoursesByCategory(category));
  if (!courseIds.length) return [];
  const courses = await Promise.all(courseIds.map((id) => getTrainingCourse(id)));
  return courses.filter((c): c is TrainingCourse => c !== null).sort((a, b) => a.order - b.order);
}

export async function createTrainingCourse(course: TrainingCourse): Promise<void> {
  const pipeline = redis.pipeline();

  const courseData = {
    ...course,
    title: JSON.stringify(course.title),
    description: JSON.stringify(course.description),
    modules: JSON.stringify(course.modules),
    requiredForTiers: course.requiredForTiers ? JSON.stringify(course.requiredForTiers) : '',
  };

  pipeline.hset(keys.trainingCourse(course.id), toRedisHash(courseData));

  // Add to all courses sorted by order
  pipeline.zadd(keys.allTrainingCourses(), {
    score: course.order,
    member: course.id,
  });

  // Add to category index
  pipeline.sadd(keys.trainingCoursesByCategory(course.category), course.id);

  // Add to published index if published
  if (course.isPublished) {
    pipeline.sadd(keys.publishedTrainingCourses(), course.id);
  }

  await pipeline.exec();
}

export async function updateTrainingCourse(id: string, updates: Partial<TrainingCourse>): Promise<void> {
  const course = await getTrainingCourse(id);
  if (!course) throw new Error('Course not found');

  const pipeline = redis.pipeline();

  const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };
  if (updates.title) updateData.title = JSON.stringify(updates.title);
  if (updates.description) updateData.description = JSON.stringify(updates.description);
  if (updates.modules) updateData.modules = JSON.stringify(updates.modules);
  if (updates.requiredForTiers) updateData.requiredForTiers = JSON.stringify(updates.requiredForTiers);

  pipeline.hset(keys.trainingCourse(id), toRedisHash(updateData as Record<string, unknown>));

  // Update category index if changed
  if (updates.category && updates.category !== course.category) {
    pipeline.srem(keys.trainingCoursesByCategory(course.category), id);
    pipeline.sadd(keys.trainingCoursesByCategory(updates.category), id);
  }

  // Update published index if changed
  if (updates.isPublished !== undefined && updates.isPublished !== course.isPublished) {
    if (updates.isPublished) {
      pipeline.sadd(keys.publishedTrainingCourses(), id);
    } else {
      pipeline.srem(keys.publishedTrainingCourses(), id);
    }
  }

  // Update order in sorted set if changed
  if (updates.order !== undefined && updates.order !== course.order) {
    pipeline.zadd(keys.allTrainingCourses(), {
      score: updates.order,
      member: id,
    });
  }

  await pipeline.exec();
}

export async function deleteTrainingCourse(id: string): Promise<void> {
  const course = await getTrainingCourse(id);
  if (!course) throw new Error('Course not found');

  const pipeline = redis.pipeline();

  pipeline.del(keys.trainingCourse(id));
  pipeline.zrem(keys.allTrainingCourses(), id);
  pipeline.srem(keys.trainingCoursesByCategory(course.category), id);
  if (course.isPublished) {
    pipeline.srem(keys.publishedTrainingCourses(), id);
  }

  await pipeline.exec();
}

export async function publishTrainingCourse(id: string): Promise<void> {
  await updateTrainingCourse(id, { isPublished: true });
}

export async function unpublishTrainingCourse(id: string): Promise<void> {
  await updateTrainingCourse(id, { isPublished: false });
}

// ============ Audit Log Operations ============

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
