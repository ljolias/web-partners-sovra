import { redis } from './client';
import { keys, TTL } from './keys';
import type {
  Partner,
  User,
  Session,
  Deal,
  DealStage,
  TrainingModule,
  TrainingProgress,
  Certification,
  LegalDocument,
  LegalSignature,
  CopilotSession,
  CopilotMessage,
  Commission,
  MEDDICScores,
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
  return partner;
}

export async function createPartner(partner: Partner): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.hset(keys.partner(partner.id), toRedisHash(partner));
  pipeline.zadd(keys.partnersByTier(partner.tier), {
    score: partner.rating,
    member: partner.id,
  });
  await pipeline.exec();
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
  await redis.hset(keys.partner(id), toRedisHash({ ...updates, updatedAt: new Date().toISOString() }));
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
  // Parse MEDDIC if stored as string
  if (typeof deal.meddic === 'string') {
    deal.meddic = JSON.parse(deal.meddic);
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

  // Store deal with MEDDIC as JSON string
  const dealData = {
    ...deal,
    meddic: JSON.stringify(deal.meddic),
  };
  pipeline.hset(keys.deal(deal.id), toRedisHash(dealData));

  // Add to partner's deals sorted by creation time
  pipeline.zadd(keys.partnerDeals(deal.partnerId), {
    score: new Date(deal.createdAt).getTime(),
    member: deal.id,
  });

  // Add to domain index for conflict checking
  pipeline.sadd(keys.dealsByDomain(deal.companyDomain), deal.id);

  // Add to stage index
  pipeline.sadd(keys.dealsByStage(deal.stage), deal.id);

  await pipeline.exec();
}

export async function updateDeal(id: string, updates: Partial<Deal>): Promise<void> {
  const deal = await getDeal(id);
  if (!deal) throw new Error('Deal not found');

  const pipeline = redis.pipeline();

  // Handle MEDDIC serialization
  const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };
  if (updates.meddic) {
    updateData.meddic = JSON.stringify(updates.meddic);
  }

  pipeline.hset(keys.deal(id), toRedisHash(updateData as Record<string, unknown>));

  // Update stage index if changed
  if (updates.stage && updates.stage !== deal.stage) {
    pipeline.srem(keys.dealsByStage(deal.stage), id);
    pipeline.sadd(keys.dealsByStage(updates.stage), id);
  }

  await pipeline.exec();
}

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

// ============ Legal Operations ============

export async function getLegalDocument(id: string): Promise<LegalDocument | null> {
  const doc = await redis.hgetall(keys.legalDocument(id)) as LegalDocument | null;
  if (!doc || !doc.id) return null;
  if (typeof doc.title === 'string') doc.title = JSON.parse(doc.title);
  if (typeof doc.content === 'string') doc.content = JSON.parse(doc.content);
  return doc;
}

export async function getAllLegalDocuments(): Promise<LegalDocument[]> {
  const docIds = await redis.smembers<string[]>(keys.legalDocuments());
  if (!docIds.length) return [];
  const docs = await Promise.all(docIds.map((id) => getLegalDocument(id)));
  return docs.filter((d): d is LegalDocument => d !== null);
}

export async function createLegalDocument(doc: LegalDocument): Promise<void> {
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
