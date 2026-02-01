'use client';

import { useTranslations } from 'next-intl';
import { Crown, Medal, Award, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PartnerTier } from '@/types';

interface TierDisplayProps {
  tier: PartnerTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const tierConfig: Record<
  PartnerTier,
  {
    icon: typeof Crown;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  platinum: {
    icon: Crown,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
  },
  gold: {
    icon: Medal,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
  },
  silver: {
    icon: Award,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
  },
  bronze: {
    icon: Shield,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
  },
};

export function TierDisplay({ tier, size = 'md', showLabel = true }: TierDisplayProps) {
  const t = useTranslations('tier');

  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizes = {
    sm: {
      container: 'px-2 py-1 gap-1',
      icon: 'h-3 w-3',
      text: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 gap-2',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2 gap-2',
      icon: 'h-5 w-5',
      text: 'text-base',
    },
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border',
        config.bgColor,
        config.borderColor,
        sizes[size].container
      )}
    >
      <Icon className={cn(sizes[size].icon, config.textColor)} />
      {showLabel && (
        <span className={cn('font-medium', sizes[size].text, config.textColor)}>
          {t(tier)}
        </span>
      )}
    </div>
  );
}
