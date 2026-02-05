import type { AchievementDefinition } from '@/types/achievements';

export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  // Core tier advancement achievements
  first_certification: {
    id: 'first_certification',
    category: 'certification',
    name: 'Primera Certificacion',
    description: 'Certifica tu primer empleado',
    icon: 'Award',
    points: 50,
    tier: 'silver',
    repeatable: false,
  },
  second_certification: {
    id: 'second_certification',
    category: 'certification',
    name: 'Segunda Certificacion',
    description: 'Certifica tu segundo empleado',
    icon: 'Award',
    points: 50,
    tier: 'gold',
    repeatable: false,
  },
  third_certification: {
    id: 'third_certification',
    category: 'certification',
    name: 'Tercera Certificacion',
    description: 'Certifica tu tercer empleado',
    icon: 'Award',
    points: 50,
    tier: 'platinum',
    repeatable: false,
  },

  // Deal achievements
  first_opportunity: {
    id: 'first_opportunity',
    category: 'deals',
    name: 'Primera Oportunidad',
    description: 'Registra tu primera oportunidad de venta',
    icon: 'TrendingUp',
    points: 30,
    tier: 'gold',
    repeatable: false,
  },
  five_opportunities: {
    id: 'five_opportunities',
    category: 'deals',
    name: 'Cinco Oportunidades',
    description: 'Registra 5 oportunidades de venta',
    icon: 'BarChart3',
    points: 50,
    tier: 'gold',
    repeatable: false,
  },
  first_deal_won: {
    id: 'first_deal_won',
    category: 'deals',
    name: 'Primer Trato Ganado',
    description: 'Cierra tu primer trato ganado',
    icon: 'Trophy',
    points: 100,
    tier: 'gold',
    repeatable: false,
  },
  two_deals_won: {
    id: 'two_deals_won',
    category: 'deals',
    name: 'Dos Tratos Ganados',
    description: 'Cierra 2 tratos ganados',
    icon: 'Trophy',
    points: 100,
    tier: 'platinum',
    repeatable: false,
  },

  // Bonus/repeatable achievements
  quick_document_signing: {
    id: 'quick_document_signing',
    category: 'compliance',
    name: 'Firma Rapida de Documentos',
    description: 'Firma documentos legales en 7 dias',
    icon: 'CheckCircle',
    points: 10,
    tier: 'bronze',
    repeatable: true,
  },
  training_module_complete: {
    id: 'training_module_complete',
    category: 'training',
    name: 'Modulo de Capacitacion Completo',
    description: 'Completa un modulo de capacitacion',
    icon: 'BookOpen',
    points: 20,
    tier: 'bronze',
    repeatable: true,
  },
  complete_profile: {
    id: 'complete_profile',
    category: 'engagement',
    name: 'Perfil Completo',
    description: 'Completa el 100% de tu perfil de partner',
    icon: 'User',
    points: 15,
    tier: 'bronze',
    repeatable: false,
  },
  attend_webinar: {
    id: 'attend_webinar',
    category: 'training',
    name: 'Asistir a Webinar',
    description: 'Asiste a un webinar o evento en vivo',
    icon: 'Video',
    points: 25,
    tier: 'bronze',
    repeatable: true,
  },
  refer_partner: {
    id: 'refer_partner',
    category: 'engagement',
    name: 'Referir Partner',
    description: 'Refiere otro partner que se una',
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
