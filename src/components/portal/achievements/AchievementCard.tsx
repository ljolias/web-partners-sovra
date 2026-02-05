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
          ? 'bg-dark-surface border border-primary/20'
          : 'bg-dark-surface/50 border border-white/5 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 rounded-lg p-2 ${
            earned ? 'bg-primary/10' : 'bg-white/5'
          }`}
        >
          {/* Use dynamic icon component */}
          {IconComponent && typeof IconComponent === 'function' ? (
            // @ts-ignore - lucide-react dynamic import
            <IconComponent
              className={`h-6 w-6 ${earned ? 'text-primary' : 'text-neutral'}`}
            />
          ) : (
            <Icons.Award
              className={`h-6 w-6 ${earned ? 'text-primary' : 'text-neutral'}`}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm text-white">
                {t(`${achievement.name}`)}
              </h4>
              <p className="text-xs text-neutral mt-1">
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
              <span className="text-xs text-neutral/60">
                {new Date(achievement.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
