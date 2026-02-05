'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight } from 'lucide-react';
import type { PartnerTier } from '@/types/achievements';

interface TierRoadmapProps {
  currentTier: PartnerTier;
  nextTier: PartnerTier | null;
}

const TIER_CONFIG: Record<PartnerTier, {
  icon: string;
  color: string;
  accentColor: string;
  minRating: number;
  discount: number;
}> = {
  bronze: {
    icon: '🟤',
    color: 'from-amber-400 to-amber-600',
    accentColor: 'amber-500',
    minRating: 0,
    discount: 5
  },
  silver: {
    icon: '⚪',
    color: 'from-slate-400 to-slate-600',
    accentColor: 'slate-400',
    minRating: 50,
    discount: 20
  },
  gold: {
    icon: '🟡',
    color: 'from-yellow-400 to-yellow-600',
    accentColor: 'yellow-400',
    minRating: 70,
    discount: 25
  },
  platinum: {
    icon: '🔷',
    color: 'from-cyan-400 to-cyan-600',
    accentColor: 'cyan-400',
    minRating: 90,
    discount: 30
  },
};

const TIERS: PartnerTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export function TierRoadmap({ currentTier, nextTier }: TierRoadmapProps) {
  const t = useTranslations();

  const currentIndex = TIERS.indexOf(currentTier);
  const isCurrentTierShown = currentIndex >= 0; // true if currentTier is valid

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-display text-white">
        {t('rewards.tier_roadmap')}
      </h3>

      {/* Grid view of tiers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {TIERS.map((tier, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          const config = TIER_CONFIG[tier];

          return (
            <div
              key={tier}
              className={`
                relative p-4 rounded-2xl border transition-all duration-200 card-hover-gradient
                ${
                  isCurrent
                    ? 'bg-dark-surface border-primary ring-2 ring-primary/50 shadow-lg scale-105'
                    : isCompleted
                      ? 'bg-dark-surface border-white/10 opacity-100'
                      : 'bg-dark-surface/50 border-white/5 opacity-50'
                }
              `}
            >
              {/* Tier Icon */}
              <div className="text-3xl mb-2">{config.icon}</div>

              {/* Tier Name */}
              <h4 className="font-bold text-sm text-white mb-2">
                {t(`tiers.${tier}`)}
              </h4>

              {/* Status Badge */}
              {isCompleted && (
                <Badge className="mb-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Check className="h-3 w-3 mr-1" />
                  {t('common.complete')}
                </Badge>
              )}
              {isCurrent && (
                <Badge className="mb-2 bg-primary/20 text-primary border border-primary/30">
                  {t('common.current')}
                </Badge>
              )}

              {/* Rating Requirement */}
              <p className="text-xs text-neutral mb-2">
                Rating: {config.minRating}+
              </p>

              {/* Discount */}
              <p className="text-sm font-semibold text-white">
                {config.discount}% discount
              </p>

              {/* Arrow to next */}
              {!isFuture && index < TIERS.length - 1 && (
                <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2">
                  <ArrowRight className={`h-6 w-6 ${isCompleted ? 'text-emerald-500' : 'text-white/20'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Message */}
      {isCurrentTierShown && nextTier && (
        <div className="p-4 bg-dark-surface border-l-4 border-primary rounded-lg card-hover-gradient">
          <p className="text-sm font-semibold text-white mb-1">
            🎯 {t('common.your_next_level')}
          </p>
          <p className="text-sm text-neutral">
            {t('rewards.next_tier_message', { tier: t(`tiers.${nextTier}`) })}
          </p>
        </div>
      )}

      {/* Platinum Achievement Message */}
      {isCurrentTierShown && !nextTier && (
        <div className="p-4 bg-dark-surface border-l-4 border-purple-500 rounded-lg card-hover-gradient">
          <p className="text-sm font-semibold text-white">
            🏆 {t('rewards.platinum_achieved')}
          </p>
        </div>
      )}
    </div>
  );
}
