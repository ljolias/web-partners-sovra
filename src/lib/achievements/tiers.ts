import type { PartnerTier, TierRequirement } from '@/types/achievements';

export const TIER_REQUIREMENTS: Record<PartnerTier, TierRequirement> = {
  bronze: {
    tier: 'bronze',
    minRating: 0,
    achievements: {
      required: [],
      optional: [
        'quick_document_signing',
        'training_module_complete',
        'complete_profile',
        'attend_webinar',
      ],
    },
    annualRequirements: {
      certifiedEmployees: 0,
      opportunities: 0,
      dealsWon: 0,
    },
    benefits: {
      discount: 5,
      features: [],
    },
  },
  silver: {
    tier: 'silver',
    minRating: 50,
    achievements: {
      required: ['first_certification'],
      optional: [
        'training_module_complete',
        'quick_document_signing',
        'complete_profile',
        'attend_webinar',
      ],
    },
    annualRequirements: {
      certifiedEmployees: 1,
      opportunities: 0,
      dealsWon: 0,
    },
    benefits: {
      discount: 20,
      features: ['priority_support'],
    },
  },
  gold: {
    tier: 'gold',
    minRating: 70,
    achievements: {
      required: [
        'first_certification',
        'second_certification',
        'first_opportunity',
        'first_deal_won',
      ],
      optional: [
        'training_module_complete',
        'quick_document_signing',
        'complete_profile',
        'attend_webinar',
        'refer_partner',
      ],
    },
    annualRequirements: {
      certifiedEmployees: 2,
      opportunities: 2,
      dealsWon: 1,
    },
    benefits: {
      discount: 25,
      features: ['priority_support', 'co_marketing'],
    },
  },
  platinum: {
    tier: 'platinum',
    minRating: 90,
    achievements: {
      required: [
        'first_certification',
        'second_certification',
        'third_certification',
        'first_opportunity',
        'first_deal_won',
        'five_opportunities',
        'two_deals_won',
      ],
      optional: [
        'training_module_complete',
        'quick_document_signing',
        'complete_profile',
        'attend_webinar',
        'refer_partner',
      ],
    },
    annualRequirements: {
      certifiedEmployees: 3,
      opportunities: 5,
      dealsWon: 2,
    },
    benefits: {
      discount: 30,
      features: ['priority_support', 'co_marketing', 'dedicated_account_manager'],
    },
  },
};

export function getTierRequirements(tier: PartnerTier): TierRequirement {
  return TIER_REQUIREMENTS[tier];
}

export function getTierDiscount(tier: PartnerTier): number {
  return TIER_REQUIREMENTS[tier].benefits.discount;
}

export function getTierBenefits(tier: PartnerTier): string[] {
  return TIER_REQUIREMENTS[tier].benefits.features;
}

export function getMinRatingForTier(tier: PartnerTier): number {
  return TIER_REQUIREMENTS[tier].minRating;
}

export function getTierHierarchy(): PartnerTier[] {
  return ['bronze', 'silver', 'gold', 'platinum'];
}

export function getNextTier(currentTier: PartnerTier): PartnerTier | null {
  const hierarchy = getTierHierarchy();
  const currentIndex = hierarchy.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === hierarchy.length - 1) {
    return null;
  }
  return hierarchy[currentIndex + 1];
}

export function getPreviousTier(currentTier: PartnerTier): PartnerTier | null {
  const hierarchy = getTierHierarchy();
  const currentIndex = hierarchy.indexOf(currentTier);
  if (currentIndex <= 0) {
    return null;
  }
  return hierarchy[currentIndex - 1];
}
