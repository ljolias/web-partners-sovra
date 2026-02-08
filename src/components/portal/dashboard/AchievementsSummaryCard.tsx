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
    .slice(0, 5);

  return (
    <Card className="h-full flex flex-col p-6 bg-[var(--color-surface)] border border-[var(--color-border)] card-hover-gradient">
      <div className="space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-[var(--color-text-primary)] flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[var(--color-primary)]" />
              {t('rewards.achievements')}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {t('rewards.tier', { tier: t(`tiers.${currentTierName}`) })}
            </p>
          </div>
          <Badge variant="default" className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
            {recentAchievements.length}{' '}
            {recentAchievements.length === 1
              ? t('common.achievement')
              : t('common.achievements')}
          </Badge>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[var(--color-surface-hover)] p-3 border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-secondary)]">Total Logros</p>
            <p className="text-xl font-bold text-[var(--color-text-primary)] mt-1">
              {recentAchievements.length}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-surface-hover)] p-3 border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-secondary)]">Tier Actual</p>
            <p className="text-xl font-bold text-[var(--color-text-primary)] mt-1 capitalize">
              {t(`tiers.${currentTierName}`)}
            </p>
          </div>
        </div>

        {/* Recent Achievements */}
        {latestAchievements.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">
              {t('rewards.recent_achievements')}
            </p>
            <div className="space-y-2">
              {latestAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 text-sm bg-[var(--color-surface-hover)] rounded-lg px-2 py-2 border border-[var(--color-border)]"
                >
                  <span className="text-base">⭐</span>
                  <span className="text-[var(--color-text-primary)] font-medium text-xs">
                    {achievement.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress to Next Tier */}
        {nextMilestone && (
          <div className="space-y-2 pt-3 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                {t('rewards.progress_to_next_tier', {
                  tier: t(`tiers.${nextMilestone.tier}`),
                })}
              </p>
              <span className="text-xs font-semibold text-[var(--color-primary)]">
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

            {/* Next Achievement to Unlock */}
            {nextMilestone.achievements.remaining.length > 0 && (
              <div className="mt-2 rounded-lg bg-[var(--color-surface-hover)] p-2 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                  Próximo logro:
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎯</span>
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">
                    {nextMilestone.achievements.remaining[0].name}
                  </span>
                </div>
              </div>
            )}
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
