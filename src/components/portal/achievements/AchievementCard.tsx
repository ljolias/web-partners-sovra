'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import type { Achievement } from '@/types/achievements';

interface AchievementCardProps {
  achievement: Achievement;
  earned: boolean;
}

export function AchievementCard({ achievement, earned }: AchievementCardProps) {
  const t = useTranslations();

  // Default to Award icon
  const iconName = achievement.icon || 'Award';
  // @ts-ignore - Dynamic icon selection from lucide-react
  const IconComponent = Icons[iconName as keyof typeof Icons] || Icons.Award;

  return (
    <Card
      className={`p-4 transition-all duration-200 card-hover-gradient ${
        earned
          ? 'bg-[var(--color-surface)] border border-[var(--color-primary)]/20'
          : 'bg-[var(--color-surface)]/50 border border-[var(--color-border)] opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 rounded-lg p-2 ${
            earned ? 'bg-[var(--color-primary)]/10' : 'bg-[var(--color-surface-hover)]'
          }`}
        >
          {/* Use dynamic icon component */}
          {IconComponent && typeof IconComponent === 'function' ? (
            // @ts-ignore - lucide-react dynamic import
            <IconComponent
              className={`h-6 w-6 ${earned ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
            />
          ) : (
            <Icons.Award
              className={`h-6 w-6 ${earned ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">
                {t(`${achievement.name}`)}
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {t(`${achievement.description}`)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge
              variant={earned ? 'default' : 'secondary'}
              className="text-xs"
            >
              +{achievement.points} pts
            </Badge>

            {earned && achievement.completedAt && (
              <span className="text-xs text-[var(--color-text-secondary)]/60">
                {new Date(achievement.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
