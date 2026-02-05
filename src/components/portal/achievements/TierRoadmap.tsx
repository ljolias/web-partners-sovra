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
  bgColor: string;
  minRating: number;
  discount: number;
}> = {
  bronze: {
    icon: '🟤',
    color: 'from-amber-400 to-amber-600',
    bgColor: 'bg-amber-50 border-amber-300',
    minRating: 0,
    discount: 5
  },
  silver: {
    icon: '⚪',
    color: 'from-slate-400 to-slate-600',
    bgColor: 'bg-slate-50 border-slate-300',
    minRating: 50,
    discount: 20
  },
  gold: {
    icon: '🟡',
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-300',
    minRating: 70,
    discount: 25
  },
  platinum: {
    icon: '🔷',
    color: 'from-cyan-400 to-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-300',
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
      <h3 className="text-lg font-semibold text-gray-900">
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
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${
                  isCurrent
                    ? `${config.bgColor} ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-105`
                    : isCompleted
                      ? `${config.bgColor} opacity-100`
                      : 'bg-gray-100 border-gray-300 opacity-50'
                }
              `}
            >
              {/* Tier Icon */}
              <div className="text-3xl mb-2">{config.icon}</div>

              {/* Tier Name */}
              <h4 className="font-bold text-sm text-gray-900 mb-2">
                {t(`tiers.${tier}`)}
              </h4>

              {/* Status Badge */}
              {isCompleted && (
                <Badge className="mb-2 bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  {t('common.complete')}
                </Badge>
              )}
              {isCurrent && (
                <Badge className="mb-2 bg-blue-500">
                  {t('common.current')}
                </Badge>
              )}

              {/* Rating Requirement */}
              <p className="text-xs text-gray-600 mb-2">
                Rating: {config.minRating}+
              </p>

              {/* Discount */}
              <p className="text-sm font-semibold text-gray-900">
                {config.discount}% discount
              </p>

              {/* Arrow to next */}
              {!isFuture && index < TIERS.length - 1 && (
                <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2">
                  <ArrowRight className={`h-6 w-6 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Message */}
      {isCurrentTierShown && nextTier && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            🎯 {t('common.your_next_level')}
          </p>
          <p className="text-sm text-blue-800">
            {t('rewards.next_tier_message', { tier: t(`tiers.${nextTier}`) })}
          </p>
        </div>
      )}

      {/* Platinum Achievement Message */}
      {isCurrentTierShown && !nextTier && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded">
          <p className="text-sm font-semibold text-purple-900">
            🏆 {t('rewards.platinum_achieved')}
          </p>
        </div>
      )}
    </div>
  );
}
