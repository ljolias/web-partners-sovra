export type AchievementCategory =
  | 'certification'
  | 'deals'
  | 'training'
  | 'compliance'
  | 'engagement';

export type PartnerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  name: string; // i18n key
  description: string; // i18n key
  icon: string; // lucide-react icon name
  points: number;
  tier: PartnerTier;
  repeatable: boolean;
  completedAt?: string;
}

export interface AchievementProgress {
  category: AchievementCategory;
  total: number;
  completed: number;
  percentage: number;
  achievements: Achievement[];
}

export interface TierEligibility {
  currentTier: PartnerTier;
  eligible: boolean;
  nextTier: PartnerTier | null;
  blockers: {
    rating: boolean; // true if rating too low
    achievements: string[]; // missing achievement IDs
    annualRequirements: boolean; // true if annual reqs not met
  };
}

export interface NextTierRequirements {
  tier: PartnerTier;
  rating: { current: number; required: number; met: boolean };
  achievements: {
    completed: Achievement[];
    remaining: Achievement[];
  };
  annualRequirements: {
    certifiedEmployees: { current: number; required: number; met: boolean };
    opportunities: { current: number; required: number; met: boolean };
    dealsWon: { current: number; required: number; met: boolean };
  };
}

export interface TierHistoryEntry {
  tier: PartnerTier;
  changedAt: string;
  reason: 'achievement' | 'annual_renewal' | 'manual';
  previousTier?: PartnerTier;
}

export interface RenewalStatus {
  nextRenewalDate: string;
  daysUntilRenewal: number;
  currentlyMeets: boolean;
  requirements: {
    certifiedEmployees: { current: number; required: number };
    opportunities: { current: number; required: number };
    dealsWon: { current: number; required: number };
  };
}

export interface AchievementDefinition extends Achievement {
  repeatable: boolean;
}

export interface TierBenefit {
  discount: number; // Percentage discount
  features: string[]; // Feature keys (i18n)
}

export interface TierRequirement {
  tier: PartnerTier;
  minRating: number;
  achievements: {
    required: string[]; // Achievement IDs that MUST be completed
    optional: string[]; // Achievements that contribute to progression
  };
  annualRequirements: {
    certifiedEmployees: number;
    opportunities: number;
    dealsWon: number;
  };
  benefits: TierBenefit;
}
