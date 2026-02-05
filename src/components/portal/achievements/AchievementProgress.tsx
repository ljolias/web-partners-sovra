'use client';

import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import type { AchievementProgress } from '@/types/achievements';

interface AchievementProgressProps {
  progress: AchievementProgress;
}

export function AchievementProgress({ progress }: AchievementProgressProps) {
  const t = useTranslations();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">
          {t(`achievements.categories.${progress.category}`)}
        </h4>
        <span className="text-sm text-neutral">
          {progress.completed} / {progress.total}
        </span>
      </div>
      <Progress value={progress.percentage} className="h-2" />
      <p className="text-xs text-neutral/60">{progress.percentage}% complete</p>
    </div>
  );
}
