import { redis } from '@/lib/redis/client';
import { getTierHistory, updateAnnualProgress, recordTierChange, getPartner, updatePartner } from '@/lib/redis';
import { checkAnnualRenewal } from './calculator';
import { TIER_REQUIREMENTS, getPreviousTier } from './tiers';
import type { PartnerTier } from '@/types/achievements';
import type { Partner } from '@/types';

/**
 * Check if a partner's annual renewal date has passed
 * and their tier should be reviewed
 */
export async function isRenewalDatePassed(partnerId: string): Promise<boolean> {
  const partner = await getPartner(partnerId);
  if (!partner) return false;

  const createdAt = new Date(partner.createdAt || Date.now());
  const anniversaryDate = new Date(createdAt);
  anniversaryDate.setFullYear(anniversaryDate.getFullYear() + 1);

  return new Date() >= anniversaryDate;
}

/**
 * Process annual renewal for a partner
 * Checks if they meet their current tier's annual requirements
 * If not, downgrades them to the next lower tier
 */
export async function processAnnualRenewal(partnerId: string): Promise<{
  success: boolean;
  previousTier: PartnerTier;
  newTier: PartnerTier;
  meetsRequirements: boolean;
}> {
  try {
    const partner = await getPartner(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    const currentTier = (partner.tier as PartnerTier) || 'bronze';
    const renewalStatus = await checkAnnualRenewal(partnerId);

    let newTier = currentTier;

    if (!renewalStatus.currentlyMeets && currentTier !== 'bronze') {
      // Partner doesn't meet requirements - downgrade to previous tier
      const downgrade = getPreviousTier(currentTier);
      if (downgrade) {
        newTier = downgrade;

        // Update partner tier
        const updatedPartner: Partial<Partner> = { ...partner, tier: newTier };
        await updatePartner(partnerId, updatedPartner);

        // Record the tier change
        await recordTierChange(
          partnerId,
          newTier,
          'annual_renewal',
          currentTier
        );
      }
    } else {
      // Partner meets requirements - maintain tier and record renewal
      await recordTierChange(
        partnerId,
        currentTier,
        'annual_renewal',
        currentTier
      );
    }

    // Reset annual progress for next year
    await updateAnnualProgress(partnerId, {
      opportunities: 0,
      deals_won: 0,
      certifications: 0,
    });

    return {
      success: true,
      previousTier: currentTier,
      newTier,
      meetsRequirements: renewalStatus.currentlyMeets,
    };
  } catch (error) {
    console.error(`Error processing renewal for partner ${partnerId}:`, error);
    throw error;
  }
}

/**
 * Process all due renewals
 * Called by cron job monthly
 * Checks all partners and processes those whose anniversary date has passed
 */
export async function processAllDueRenewals(): Promise<{
  processed: number;
  upgraded: number;
  downgraded: number;
  maintained: number;
  errors: number;
}> {
  const stats = {
    processed: 0,
    upgraded: 0,
    downgraded: 0,
    maintained: 0,
    errors: 0,
  };

  try {
    // Get all partner IDs - this is a simplified version
    // In production, you'd fetch paginated results from a sorted set of all partners
    const allPartnersKey = 'partners:all';
    const partnerIds = await redis.zrange<string[]>(allPartnersKey, 0, -1);

    for (const partnerId of partnerIds) {
      try {
        const shouldRenew = await isRenewalDatePassed(partnerId);

        if (shouldRenew) {
          const result = await processAnnualRenewal(partnerId);

          stats.processed++;

          if (result.meetsRequirements) {
            stats.maintained++;
          } else if (result.newTier === result.previousTier) {
            stats.maintained++;
          } else {
            stats.downgraded++;
          }
        }
      } catch (error) {
        console.error(`Error renewing partner ${partnerId}:`, error);
        stats.errors++;
      }
    }

    return stats;
  } catch (error) {
    console.error('Error processing all renewals:', error);
    throw error;
  }
}
