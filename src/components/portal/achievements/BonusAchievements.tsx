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
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('rewards.bonus_achievements')}
          </h3>
        </div>

        <p className="text-sm text-gray-700">
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

        <div className="p-3 bg-white rounded border border-amber-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-amber-900">
              {t('rewards.tip')}:
            </span>{' '}
            {t('rewards.bonus_tip')}
          </p>
        </div>
      </div>
    </Card>
  );
}
