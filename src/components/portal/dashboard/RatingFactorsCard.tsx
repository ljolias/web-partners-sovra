'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp, Users, Award, ShieldCheck, DollarSign } from 'lucide-react';

interface RatingFactorsCardProps {
  className?: string;
}

export function RatingFactorsCard({ className }: RatingFactorsCardProps) {
  const t = useTranslations('rating');

  const factors = [
    {
      icon: TrendingUp,
      name: t('factors.dealQuality.name'),
      description: t('factors.dealQuality.description'),
      color: 'text-blue-500',
    },
    {
      icon: Users,
      name: t('factors.engagement.name'),
      description: t('factors.engagement.description'),
      color: 'text-purple-500',
    },
    {
      icon: Award,
      name: t('factors.certification.name'),
      description: t('factors.certification.description'),
      color: 'text-yellow-500',
    },
    {
      icon: ShieldCheck,
      name: t('factors.compliance.name'),
      description: t('factors.compliance.description'),
      color: 'text-green-500',
    },
    {
      icon: DollarSign,
      name: t('factors.revenue.name'),
      description: t('factors.revenue.description'),
      color: 'text-orange-500',
    },
  ];

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
        {t('factorsTitle')}
      </h3>
      <p className="text-xs text-[var(--color-text-secondary)] mb-4">
        {t('factorsDescription')}
      </p>
      <div className="space-y-3">
        {factors.map((factor) => {
          const Icon = factor.icon;
          return (
            <div key={factor.name} className="flex items-start gap-3">
              <div className={`mt-0.5 ${factor.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {factor.name}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                  {factor.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
