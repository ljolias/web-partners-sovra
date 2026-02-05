'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowRight } from 'lucide-react';
import type { Achievement, NextTierRequirements } from '@/types/achievements';

interface AchievementsSummaryCardProps {
  recentAchievements: Achievement[];
  nextMilestone: NextTierRequirements | null;
  currentTierName: string;
}

export function AchievementsSummaryCard({
  recentAchievements,
  nextMilestone,
  currentTierName,
}: AchievementsSummaryCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const latestAchievements = recentAchievements
    .sort((a, b) => {
      if (!a.completedAt || !b.completedAt) return 0;
      return (
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
    })
    .slice(0, 2);

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-indigo-600" />
              {t('rewards.achievements')}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {t('rewards.tier', { tier: t(`tiers.${currentTierName}`) })}
            </p>
          </div>
          <Badge variant="default">
            {recentAchievements.length}{' '}
            {recentAchievements.length === 1
              ? t('common.achievement')
              : t('common.achievements')}
          </Badge>
        </div>

        {/* Recent Achievements */}
        {latestAchievements.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">
              {t('rewards.recent_achievements')}
            </p>
            <div className="space-y-2">
              {latestAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 text-sm bg-white rounded px-3 py-2"
                >
                  <span className="text-lg">⭐</span>
                  <span className="text-gray-900 font-medium">
                    {t(`${achievement.name}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress to Next Tier */}
        {nextMilestone && (
          <div className="space-y-2 pt-3 border-t border-indigo-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">
                {t('rewards.progress_to_next_tier', {
                  tier: t(`tiers.${nextMilestone.tier}`),
                })}
              </p>
              <span className="text-xs font-semibold text-indigo-600">
                {nextMilestone.achievements.completed.length} /
                {nextMilestone.achievements.completed.length +
                  nextMilestone.achievements.remaining.length}
              </span>
            </div>
            <Progress
              value={
                (nextMilestone.achievements.completed.length /
                  (nextMilestone.achievements.completed.length +
                    nextMilestone.achievements.remaining.length)) *
                100
              }
              className="h-2"
            />
          </div>
        )}

        {/* CTA Button */}
        <Link href={`/${locale}/partners/portal/rewards`}>
          <Button variant="primary" className="w-full justify-between">
            {t('rewards.view_rewards')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
