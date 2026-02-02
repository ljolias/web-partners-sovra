'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Award,
  Star,
  Users,
  FileText,
  Clock,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
  'dollar-sign': DollarSign,
  award: Award,
  star: Star,
  users: Users,
  'file-text': FileText,
  clock: Clock,
  trophy: Trophy,
} as const;

type IconName = keyof typeof iconMap;

interface StatsCardProps {
  title: string;
  value: string | number;
  iconName: IconName;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'green' | 'purple' | 'orange';
}

export function StatsCard({ title, value, iconName, trend, color = 'primary' }: StatsCardProps) {
  const colors = {
    primary: {
      bg: 'bg-[var(--color-primary)]/10',
      border: 'border-[var(--color-primary)]/20',
      icon: 'text-[var(--color-primary)]',
    },
    green: {
      bg: 'bg-[var(--color-accent-green)]/10',
      border: 'border-[var(--color-accent-green)]/20',
      icon: 'text-[var(--color-accent-green)]',
    },
    purple: {
      bg: 'bg-[var(--color-accent-purple)]/10',
      border: 'border-[var(--color-accent-purple)]/20',
      icon: 'text-[var(--color-accent-purple)]',
    },
    orange: {
      bg: 'bg-[var(--color-accent-orange)]/10',
      border: 'border-[var(--color-accent-orange)]/20',
      icon: 'text-[var(--color-accent-orange)]',
    },
  };

  const Icon = iconMap[iconName];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] truncate">{title}</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-1 sm:mt-2 text-xs sm:text-sm font-medium',
                trend.isPositive ? 'text-[var(--color-accent-green)]' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-2 sm:p-3 border shrink-0', colors[color].bg, colors[color].border)}>
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', colors[color].icon)} />
        </div>
      </div>
    </motion.div>
  );
}
