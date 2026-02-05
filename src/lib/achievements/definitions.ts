import type { AchievementDefinition } from '@/types/achievements';

export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  // Core tier advancement achievements
  first_certification: {
    id: 'first_certification',
    category: 'certification',
    name: 'achievements.first_certification.name',
    description: 'achievements.first_certification.description',
    icon: 'Award',
    points: 50,
    tier: 'silver',
    repeatable: false,
  },
  second_certification: {
    id: 'second_certification',
    category: 'certification',
    name: 'achievements.second_certification.name',
    description: 'achievements.second_certification.description',
    icon: 'Award',
    points: 50,
    tier: 'gold',
    repeatable: false,
  },
  third_certification: {
    id: 'third_certification',
    category: 'certification',
    name: 'achievements.third_certification.name',
    description: 'achievements.third_certification.description',
    icon: 'Award',
    points: 50,
    tier: 'platinum',
    repeatable: false,
  },

  // Deal achievements
  first_opportunity: {
    id: 'first_opportunity',
    category: 'deals',
    name: 'achievements.first_opportunity.name',
    description: 'achievements.first_opportunity.description',
    icon: 'TrendingUp',
    points: 30,
    tier: 'gold',
    repeatable: false,
  },
  five_opportunities: {
    id: 'five_opportunities',
    category: 'deals',
    name: 'achievements.five_opportunities.name',
    description: 'achievements.five_opportunities.description',
    icon: 'BarChart3',
    points: 50,
    tier: 'gold',
    repeatable: false,
  },
  first_deal_won: {
    id: 'first_deal_won',
    category: 'deals',
    name: 'achievements.first_deal_won.name',
    description: 'achievements.first_deal_won.description',
    icon: 'Trophy',
    points: 100,
    tier: 'gold',
    repeatable: false,
  },
  two_deals_won: {
    id: 'two_deals_won',
    category: 'deals',
    name: 'achievements.two_deals_won.name',
    description: 'achievements.two_deals_won.description',
    icon: 'Trophy',
    points: 100,
    tier: 'platinum',
    repeatable: false,
  },

  // Bonus/repeatable achievements
  quick_document_signing: {
    id: 'quick_document_signing',
    category: 'compliance',
    name: 'achievements.quick_document_signing.name',
    description: 'achievements.quick_document_signing.description',
    icon: 'CheckCircle',
    points: 10,
    tier: 'bronze',
    repeatable: true,
  },
  training_module_complete: {
    id: 'training_module_complete',
    category: 'training',
    name: 'achievements.training_module_complete.name',
    description: 'achievements.training_module_complete.description',
    icon: 'BookOpen',
    points: 20,
    tier: 'bronze',
    repeatable: true,
  },
  complete_profile: {
    id: 'complete_profile',
    category: 'engagement',
    name: 'achievements.complete_profile.name',
    description: 'achievements.complete_profile.description',
    icon: 'User',
    points: 15,
    tier: 'bronze',
    repeatable: false,
  },
  attend_webinar: {
    id: 'attend_webinar',
    category: 'training',
    name: 'achievements.attend_webinar.name',
    description: 'achievements.attend_webinar.description',
    icon: 'Video',
    points: 25,
    tier: 'bronze',
    repeatable: true,
  },
  refer_partner: {
    id: 'refer_partner',
    category: 'engagement',
    name: 'achievements.refer_partner.name',
    description: 'achievements.refer_partner.description',
    icon: 'Users',
    points: 50,
    tier: 'bronze',
    repeatable: true,
  },
};

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS[id];
}

export function getAchievementsByCategory(
  category: string,
): AchievementDefinition[] {
  return Object.values(ACHIEVEMENTS).filter(
    (achievement) => achievement.category === category,
  );
}

export function getAllAchievements(): AchievementDefinition[] {
  return Object.values(ACHIEVEMENTS);
}
