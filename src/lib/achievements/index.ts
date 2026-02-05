// Achievement Definitions
export {
  ACHIEVEMENTS,
  getAchievementById,
  getAchievementsByCategory,
  getAllAchievements,
  getAchievementByIdDynamic,
  getAchievementsByCategoryDynamic,
  getAllAchievementsDynamic,
} from './definitions';

// Tier Configuration
export {
  TIER_REQUIREMENTS,
  getTierRequirements,
  getTierDiscount,
  getTierBenefits,
  getMinRatingForTier,
  getTierHierarchy,
  getNextTier,
  getPreviousTier,
} from './tiers';

// Achievement Tracking
export {
  checkAndAwardAchievement,
  getPartnerAchievements,
  getAchievementProgressByCategory,
  hasAchievement,
  getAchievementCount,
  removeAchievement,
  clearAllAchievements,
} from './tracker';

// Re-export from redis operations for convenience
export { incrementAnnualMetric } from '@/lib/redis';

// Tier Eligibility Calculation
export {
  calculateTierEligibility,
  getNextTierRequirements,
  checkAnnualRenewal,
} from './calculator';

// Annual Renewal
export {
  isRenewalDatePassed,
  processAnnualRenewal,
  processAllDueRenewals,
} from './renewal';

// Types (re-export from types module)
export type {
  Achievement,
  AchievementProgress,
  TierEligibility,
  NextTierRequirements,
  TierHistoryEntry,
  RenewalStatus,
  AchievementDefinition,
  TierBenefit,
  TierRequirement,
  AchievementCategory,
  PartnerTier,
} from '@/types/achievements';
