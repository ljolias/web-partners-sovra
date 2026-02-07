import { redis } from '@/lib/redis/client';
import { getCachedRating } from '@/lib/rating/calculator';
import { keys } from '@/lib/redis/keys';
import { getPartnerAchievements } from './tracker';
import { TIER_REQUIREMENTS, getTierHierarchy, getNextTier } from './tiers';
import type {
  PartnerTier,
  TierEligibility,
  NextTierRequirements,
  RenewalStatus,
} from '@/types/achievements';
import { ACHIEVEMENTS } from './definitions';

import { logger } from '@/lib/logger';
/**
 * Get partner's current rating score
 * Returns cached rating or defaults to 0
 */
async function getPartnerRatingScore(partnerId: string): Promise<number> {
  try {
    const cached = await getCachedRating(partnerId);
    if (cached && typeof cached === 'object' && 'score' in cached) {
      return (cached as any).score || 0;
    }
    // Fallback: get partner tier and estimate minimum score
    const partner = await redis.hget(`partner:${partnerId}`, 'rating');
    if (partner) {
      const rating = parseFloat(String(partner));
      return isNaN(rating) ? 0 : rating;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Get all annual requirement metrics for a partner
 * These are based on actual event counts, not achievements
 */
async function getAnnualRequirementMetrics(
  partnerId: string,
): Promise<{
  certifiedEmployees: number;
  opportunities: number;
  dealsWon: number;
}> {
  // These would be calculated from actual events
  // For now, we'll use achievement counts as proxies
  let certifiedEmployees = 0;
  let opportunities = 0;
  let dealsWon = 0;

  // Count certifications based on achievements
  if (await redis.hexists(`partner:achievements:${partnerId}`, 'first_certification')) {
    certifiedEmployees++;
  }
  if (await redis.hexists(`partner:achievements:${partnerId}`, 'second_certification')) {
    certifiedEmployees++;
  }
  if (await redis.hexists(`partner:achievements:${partnerId}`, 'third_certification')) {
    certifiedEmployees++;
  }

  // Count opportunities and deals
  const oppValue = await redis.hget(`partner:${partnerId}:annual:progress`, 'opportunities');
  const dealsValue = await redis.hget(`partner:${partnerId}:annual:progress`, 'deals_won');

  opportunities = oppValue ? parseInt(String(oppValue), 10) : 0;
  dealsWon = dealsValue ? parseInt(String(dealsValue), 10) : 0;

  return { certifiedEmployees, opportunities, dealsWon };
}

/**
 * Calculate tier eligibility for a partner
 */
export async function calculateTierEligibility(
  partnerId: string,
): Promise<TierEligibility> {
  try {
    // Get current tier and rating
    const partnerData = await redis.hgetall(`partner:${partnerId}`);
    const currentTier = (partnerData && typeof partnerData === 'object' && 'tier' in partnerData
      ? partnerData.tier as PartnerTier
      : 'bronze');
    const rating = await getPartnerRatingScore(partnerId);

    // Get earned achievements
    const earnedAchievements = await getPartnerAchievements(partnerId);
    const earnedIds = new Set(earnedAchievements.map((a) => a.id));

    // Get annual metrics
    const annualMetrics = await getAnnualRequirementMetrics(partnerId);

    // Check next tier eligibility
    const nextTierName = getNextTier(currentTier);
    if (!nextTierName) {
      // Already at platinum
      return {
        currentTier,
        eligible: false,
        nextTier: null,
        blockers: { rating: false, achievements: [], annualRequirements: false },
      };
    }

    const nextTierReqs = TIER_REQUIREMENTS[nextTierName];
    const blockers: TierEligibility['blockers'] = {
      rating: rating < nextTierReqs.minRating,
      achievements: [],
      annualRequirements: false,
    };

    // Check required achievements
    for (const requiredId of nextTierReqs.achievements.required) {
      if (!earnedIds.has(requiredId)) {
        blockers.achievements.push(requiredId);
      }
    }

    // Check annual requirements
    const annualBlockers = {
      certifiedEmployees:
        annualMetrics.certifiedEmployees <
        nextTierReqs.annualRequirements.certifiedEmployees,
      opportunities:
        annualMetrics.opportunities < nextTierReqs.annualRequirements.opportunities,
      dealsWon: annualMetrics.dealsWon < nextTierReqs.annualRequirements.dealsWon,
    };

    blockers.annualRequirements = Object.values(annualBlockers).some(Boolean);

    const eligible =
      !blockers.rating && blockers.achievements.length === 0 && !blockers.annualRequirements;

    return {
      currentTier,
      eligible,
      nextTier: nextTierName,
      blockers,
    };
  } catch (error) {
    logger.error('Error calculating tier eligibility:', { error: error });
    throw error;
  }
}

/**
 * Get detailed requirements for the next tier
 */
export async function getNextTierRequirements(
  partnerId: string,
): Promise<NextTierRequirements | null> {
  try {
    const eligibility = await calculateTierEligibility(partnerId);
    if (!eligibility.nextTier) {
      return null;
    }

    const nextTierReqs = TIER_REQUIREMENTS[eligibility.nextTier];
    const earnedAchievements = await getPartnerAchievements(partnerId);
    const earnedIds = new Set(earnedAchievements.map((a) => a.id));
    const rating = await getPartnerRatingScore(partnerId);
    const annualMetrics = await getAnnualRequirementMetrics(partnerId);

    // Separate required from optional achievements
    const requiredAchievements = nextTierReqs.achievements.required.map((id) => ({
      ...ACHIEVEMENTS[id],
      completedAt: earnedAchievements.find((a) => a.id === id)?.completedAt,
    }));

    const completedRequired = requiredAchievements.filter((a) => earnedIds.has(a.id));
    const remainingRequired = requiredAchievements.filter((a) => !earnedIds.has(a.id));

    return {
      tier: eligibility.nextTier,
      rating: {
        current: rating,
        required: nextTierReqs.minRating,
        met: rating >= nextTierReqs.minRating,
      },
      achievements: {
        completed: completedRequired,
        remaining: remainingRequired,
      },
      annualRequirements: {
        certifiedEmployees: {
          current: annualMetrics.certifiedEmployees,
          required: nextTierReqs.annualRequirements.certifiedEmployees,
          met:
            annualMetrics.certifiedEmployees >=
            nextTierReqs.annualRequirements.certifiedEmployees,
        },
        opportunities: {
          current: annualMetrics.opportunities,
          required: nextTierReqs.annualRequirements.opportunities,
          met:
            annualMetrics.opportunities >= nextTierReqs.annualRequirements.opportunities,
        },
        dealsWon: {
          current: annualMetrics.dealsWon,
          required: nextTierReqs.annualRequirements.dealsWon,
          met: annualMetrics.dealsWon >= nextTierReqs.annualRequirements.dealsWon,
        },
      },
    };
  } catch (error) {
    logger.error('Error calculating next tier requirements:', { error: error });
    throw error;
  }
}

/**
 * Check annual renewal status for a partner
 */
export async function checkAnnualRenewal(partnerId: string): Promise<RenewalStatus> {
  try {
    const partnerData = await redis.hgetall(`partner:${partnerId}`);
    if (!partnerData) {
      throw new Error(`Partner ${partnerId} not found`);
    }
    const currentTier = (partnerData.tier as PartnerTier) || 'bronze';
    const createdAtValue = (partnerData.createdAt as string) || String(Date.now());
    const createdAt = new Date(createdAtValue);

    // Calculate next renewal date (1 year from creation)
    const nextRenewalDate = new Date(createdAt);
    nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
    const nextRenewalISO = nextRenewalDate.toISOString();

    // Calculate days until renewal
    const now = new Date();
    const daysUntilRenewal = Math.ceil(
      (nextRenewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Get annual metrics
    const annualMetrics = await getAnnualRequirementMetrics(partnerId);
    const tierReqs = TIER_REQUIREMENTS[currentTier];

    // Check if current tier requirements are met
    const currentlyMeets =
      annualMetrics.certifiedEmployees >= tierReqs.annualRequirements.certifiedEmployees &&
      annualMetrics.opportunities >= tierReqs.annualRequirements.opportunities &&
      annualMetrics.dealsWon >= tierReqs.annualRequirements.dealsWon;

    return {
      nextRenewalDate: nextRenewalISO,
      daysUntilRenewal,
      currentlyMeets,
      requirements: {
        certifiedEmployees: {
          current: annualMetrics.certifiedEmployees,
          required: tierReqs.annualRequirements.certifiedEmployees,
        },
        opportunities: {
          current: annualMetrics.opportunities,
          required: tierReqs.annualRequirements.opportunities,
        },
        dealsWon: {
          current: annualMetrics.dealsWon,
          required: tierReqs.annualRequirements.dealsWon,
        },
      },
    };
  } catch (error) {
    logger.error('Error checking annual renewal:', { error: error });
    throw error;
  }
}
