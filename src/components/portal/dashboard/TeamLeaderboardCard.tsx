import { Trophy, TrendingUp, Award, Briefcase, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import type { LeaderboardEntry } from '@/lib/redis/operations/teamAnalytics';

interface TeamLeaderboardCardProps {
  title: string;
  entries: LeaderboardEntry[];
  icon?: 'trophy' | 'briefcase' | 'award' | 'trending';
  emptyMessage?: string;
}

const iconMap = {
  trophy: Trophy,
  briefcase: Briefcase,
  award: Award,
  trending: TrendingUp,
};

const iconColors = {
  trophy: 'text-amber-500',
  briefcase: 'text-indigo-500',
  award: 'text-emerald-500',
  trending: 'text-purple-500',
};

export function TeamLeaderboardCard({
  title,
  entries,
  icon = 'trophy',
  emptyMessage = 'No hay datos aún',
}: TeamLeaderboardCardProps) {
  const Icon = iconMap[icon];
  const iconColor = iconColors[icon];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  {index === 0 ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  ) : index === 1 ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                  ) : index === 2 ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800">
                      <span className="text-sm font-bold text-white">3</span>
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-hover)]">
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.userName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {entry.userName}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {entry.label}
                  </p>
                </div>

                {/* Value Badge */}
                <Badge
                  variant={index === 0 ? 'default' : 'secondary'}
                  className="flex-shrink-0"
                >
                  {entry.value}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
