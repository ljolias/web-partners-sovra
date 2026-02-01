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
  // Sovra brand colors
  const colors = {
    primary: {
      bg: 'bg-[#0099ff]/10',
      border: 'border-[#0099ff]/20',
      icon: 'text-[#0099ff]',
    },
    green: {
      bg: 'bg-[#22c55e]/10',
      border: 'border-[#22c55e]/20',
      icon: 'text-[#22c55e]',
    },
    purple: {
      bg: 'bg-[#8b5cf6]/10',
      border: 'border-[#8b5cf6]/20',
      icon: 'text-[#8b5cf6]',
    },
    orange: {
      bg: 'bg-[#f97316]/10',
      border: 'border-[#f97316]/20',
      icon: 'text-[#f97316]',
    },
  };

  const Icon = iconMap[iconName];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/5 bg-[#0f0d1a] p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#888888]">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-[#22c55e]' : 'text-red-400'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-3 border', colors[color].bg, colors[color].border)}>
          <Icon className={cn('h-6 w-6', colors[color].icon)} />
        </div>
      </div>
    </motion.div>
  );
}
