'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import type { AchievementDefinition } from '@/types/achievements';
import { AchievementCard } from './AchievementCard';

interface BonusAchievementsProps {
  opportunities: AchievementDefinition[];
  earnedIds: Set<string>;
}

export function BonusAchievements({
  opportunities,
  earnedIds,
}: BonusAchievementsProps) {
  const t = useTranslations();

  return (
    <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] card-hover-gradient">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-bold font-display text-[var(--color-text-primary)]">
            {t('rewards.bonus_achievements')}
          </h3>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('rewards.bonus_description')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {opportunities.map((achievement) => {
            const earned = earnedIds.has(achievement.id);
            return (
              <AchievementCard
                key={achievement.id}
                achievement={{
                  ...achievement,
                  completedAt: undefined,
                }}
                earned={earned}
              />
            );
          })}
        </div>

        <div className="p-3 bg-[var(--color-surface-hover)] rounded-lg border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-secondary)]">
            <span className="font-semibold text-amber-400">
              {t('rewards.tip')}:
            </span>{' '}
            {t('rewards.bonus_tip')}
          </p>
        </div>
      </div>
    </Card>
  );
}
