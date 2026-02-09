import { redis } from '@/lib/redis/client';
import { keys } from '@/lib/redis/keys';
import {
  getPartnerDeals,
  getUserCertifications,
  getPartner,
  updatePartner,
  getAllLegalDocuments,
  getUserSignatures,
} from '@/lib/redis/operations';
import { getPartnerEventsInRange } from './events';
import type { PartnerTier, RatingCalculation, Deal, Certification } from '@/types';

// Factor weights (total = 100%)
export const FACTOR_WEIGHTS = {
  dealQuality: 0.30, // 30%
  engagement: 0.25, // 25%
  certification: 0.20, // 20%
  compliance: 0.15, // 15%
  revenue: 0.10, // 10%
};

// Tier thresholds
export const TIER_THRESHOLDS: { tier: PartnerTier; minScore: number }[] = [
  { tier: 'platinum', minScore: 90 },
  { tier: 'gold', minScore: 70 },
  { tier: 'silver', minScore: 50 },
  { tier: 'bronze', minScore: 0 },
];

/**
 * Get tier based on score
 */
export function getTierFromScore(score: number): PartnerTier {
  for (const threshold of TIER_THRESHOLDS) {
    if (score >= threshold.minScore) {
      return threshold.tier;
    }
  }
  return 'bronze';
}

/**
 * Calculate deal quality factor (0-100)
 * Based on approval rate and win rate for government deals
 */
function calculateDealQualityFactor(deals: Deal[]): number {
  if (deals.length === 0) return 50; // Neutral score for new partners

  // Calculate approval rate (how many deals get approved)
  const approvedOrClosedDeals = deals.filter((d) =>
    ['approved', 'won', 'lost'].includes(d.status)
  );
  const approvalRate = deals.length > 0 ? approvedOrClosedDeals.length / deals.length : 0;

  // Calculate win rate for closed deals
  const closedDeals = deals.filter((d) =>
    ['won', 'lost'].includes(d.status)
  );
  const wonDeals = closedDeals.filter((d) => d.status === 'won');
  const winRate = closedDeals.length > 0 ? wonDeals.length / closedDeals.length : 0;

  // Calculate partner lead generation rate
  const partnerLeads = deals.filter((d) => d.partnerGeneratedLead).length;
  const leadGenerationRate = deals.length > 0 ? partnerLeads / deals.length : 0;

  // Weighted combination: 40% approval rate, 40% win rate, 20% lead generation
  return (approvalRate * 40) + (winRate * 40) + (leadGenerationRate * 20);
}

/**
 * Calculate engagement factor (0-100)
 * Based on copilot usage, training, login frequency
 */
async function calculateEngagementFactor(
  partnerId: string,
  _userId: string
): Promise<number> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const events = await getPartnerEventsInRange(partnerId, thirtyDaysAgo, now);

  // Count engagement events
  const copilotSessions = events.filter(
    (e) => e.eventType === 'COPILOT_SESSION_COMPLETED'
  ).length;
  const trainingModules = events.filter(
    (e) => e.eventType === 'TRAINING_MODULE_COMPLETED'
  ).length;

  // Check for login activity (negative event would indicate inactivity)
  const inactiveEvents = events.filter(
    (e) => e.eventType === 'LOGIN_INACTIVE_30_DAYS'
  ).length;

  // Score based on activity
  let score = 50; // Base score

  // Copilot usage: +5 per session, max +25
  score += Math.min(copilotSessions * 5, 25);

  // Training: +10 per module, max +20
  score += Math.min(trainingModules * 10, 20);

  // Penalize inactivity
  score -= inactiveEvents * 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate certification factor (0-100)
 * Based on active certifications
 */
function calculateCertificationFactor(certifications: Certification[]): number {
  const now = new Date();
  const activeCerts = certifications.filter(
    (c) => c.status === 'active' && new Date(c.expiresAt) > now
  );

  if (activeCerts.length === 0) return 20; // Minimum score
  if (activeCerts.length === 1) return 60;
  if (activeCerts.length === 2) return 80;
  return 100; // 3+ certifications
}

/**
 * Calculate compliance factor (0-100)
 * Based on signed legal documents
 */
async function calculateComplianceFactor(
  partnerId: string,
  userId: string
): Promise<number> {
  const [docs, signatures] = await Promise.all([
    getAllLegalDocuments(),
    getUserSignatures(userId),
  ]);

  const requiredDocs = docs.filter((d) => d.requiredForDeals);
  if (requiredDocs.length === 0) return 100;

  const signedDocIds = new Set(signatures.map((s) => s.documentId));
  const signedCount = requiredDocs.filter((d) => signedDocIds.has(d.id)).length;

  return (signedCount / requiredDocs.length) * 100;
}

/**
 * Calculate revenue factor (0-100)
 * Based on closed deals (count-based since deal values are in quotes now)
 */
function calculateRevenueFactor(deals: Deal[]): number {
  const wonDeals = deals.filter((d) => d.status === 'won');

  if (wonDeals.length === 0) return 30; // Minimum score for new partners

  // Score based on number of won deals
  let score = Math.min(wonDeals.length * 15, 70); // Max 70 from deal count

  // Bonus for larger populations (bigger government deals)
  const avgPopulation = wonDeals.reduce((sum, d) => sum + d.population, 0) / wonDeals.length;

  // Add bonus based on average population served
  if (avgPopulation >= 1000000) score += 30;
  else if (avgPopulation >= 500000) score += 20;
  else if (avgPopulation >= 100000) score += 10;

  return Math.min(100, score);
}

/**
 * Calculate full partner rating
 */
export async function calculatePartnerRating(
  partnerId: string,
  userId: string
): Promise<RatingCalculation> {
  const [deals, certifications] = await Promise.all([
    getPartnerDeals(partnerId),
    getUserCertifications(userId),
  ]);

  const [engagementFactor, complianceFactor] = await Promise.all([
    calculateEngagementFactor(partnerId, userId),
    calculateComplianceFactor(partnerId, userId),
  ]);

  const factors = {
    dealQuality: calculateDealQualityFactor(deals),
    engagement: engagementFactor,
    certification: calculateCertificationFactor(certifications),
    compliance: complianceFactor,
    revenue: calculateRevenueFactor(deals),
  };

  // Calculate weighted total
  const totalScore = Math.round(
    factors.dealQuality * FACTOR_WEIGHTS.dealQuality +
      factors.engagement * FACTOR_WEIGHTS.engagement +
      factors.certification * FACTOR_WEIGHTS.certification +
      factors.compliance * FACTOR_WEIGHTS.compliance +
      factors.revenue * FACTOR_WEIGHTS.revenue
  );

  const calculation: RatingCalculation = {
    partnerId,
    totalScore,
    tier: getTierFromScore(totalScore),
    factors,
    calculatedAt: new Date().toISOString(),
  };

  return calculation;
}

/**
 * Recalculate rating and update partner record
 */
export async function recalculateAndUpdatePartner(
  partnerId: string,
  userId: string
): Promise<RatingCalculation> {
  const calculation = await calculatePartnerRating(partnerId, userId);

  // Store calculation
  await redis.set(
    keys.ratingCalculation(partnerId),
    JSON.stringify(calculation)
  );

  // Update partner tier if changed
  const partner = await getPartner(partnerId);
  if (partner && partner.tier !== calculation.tier) {
    await updatePartner(partnerId, {
      tier: calculation.tier,
      rating: calculation.totalScore,
    });
  } else if (partner) {
    // Just update the rating score
    await updatePartner(partnerId, {
      rating: calculation.totalScore,
    });
  }

  return calculation;
}

/**
 * Get cached rating calculation
 */
export async function getCachedRating(
  partnerId: string
): Promise<RatingCalculation | null> {
  const data = await redis.get<string>(keys.ratingCalculation(partnerId));
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}
