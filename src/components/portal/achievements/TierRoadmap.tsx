'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { PartnerTier } from '@/types/achievements';

interface TierRoadmapProps {
  currentTier: PartnerTier;
  nextTier: PartnerTier | null;
}

const TIER_HIERARCHY: Record<PartnerTier, {
  icon: string;
  index: number;
  minRating: number;
  discount: number;
}> = {
  bronze: { icon: '🟤', index: 0, minRating: 0, discount: 5 },
  silver: { icon: '⚪', index: 1, minRating: 50, discount: 20 },
  gold: { icon: '🟡', index: 2, minRating: 70, discount: 25 },
  platinum: { icon: '🔷', index: 3, minRating: 90, discount: 30 },
};

const TIERS: PartnerTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export function TierRoadmap({ currentTier, nextTier }: TierRoadmapProps) {
  const t = useTranslations();
  const currentIndex = TIER_HIERARCHY[currentTier].index;

  return (
    <div className="space-y-6">
      {/* Title */}
      <h3 className="text-xl font-bold font-display text-[var(--color-text-primary)]">
        {t('rewards.tier_roadmap')}
      </h3>

      {/* Tier Progression - Linear Layout */}
      <div className="space-y-3">
        {TIERS.map((tier, index) => {
          const config = TIER_HIERARCHY[tier];
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={tier} className="flex items-center gap-3">
              {/* Tier Indicator */}
              <div className="flex items-center gap-3 flex-1">
                {/* Status Circle */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-all ${
                    isCurrent
                      ? 'bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30'
                      : isCompleted
                        ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                        : 'bg-[var(--color-surface-hover)] border-2 border-[var(--color-border)]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <span>{config.icon}</span>
                  )}
                </div>

                {/* Tier Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4
                      className={`font-semibold capitalize ${
                        isCurrent
                          ? 'text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {t(`tiers.${tier}`)}
                    </h4>
                    {isCurrent && (
                      <Badge className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 text-xs">
                        Current
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Achieved
                      </Badge>
                    )}
                  </div>

                  {/* Requirements */}
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {config.discount}% discount • Rating {config.minRating}+
                  </p>
                </div>
              </div>

              {/* Progress Bar (only for future tiers) */}
              {isFuture && currentTier !== 'platinum' && (
                <div className="hidden md:flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <div className="w-12 h-1 bg-[var(--color-border)] rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      {nextTier && currentTier !== 'platinum' && (
        <div className="p-4 bg-[var(--color-surface-hover)] rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-primary)] font-medium">
            🎯 Next milestone: <span className="text-[var(--color-primary)]">{t(`tiers.${nextTier}`)}</span>
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {t('rewards.next_tier_message', { tier: t(`tiers.${nextTier}`) })}
          </p>
        </div>
      )}

      {/* Platinum Achieved */}
      {currentTier === 'platinum' && (
        <div className="p-4 bg-[var(--color-surface-hover)] rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-primary)] font-medium">
            🏆 {t('rewards.platinum_achieved')}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {t('rewards.platinum_message')}
          </p>
        </div>
      )}
    </div>
  );
}
