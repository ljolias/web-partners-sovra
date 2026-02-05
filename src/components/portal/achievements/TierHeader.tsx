'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import type { PartnerTier } from '@/types/achievements';
import { TIER_REQUIREMENTS } from '@/lib/achievements';

const TIER_ICONS: Record<PartnerTier, keyof typeof Icons> = {
  bronze: 'Shield',
  silver: 'Star',
  gold: 'Trophy',
  platinum: 'Crown',
};

interface TierHeaderProps {
  currentTier: PartnerTier;
  totalPoints: number;
  showBenefits?: boolean;
}

export function TierHeader({
  currentTier,
  totalPoints,
  showBenefits = true,
}: TierHeaderProps) {
  const t = useTranslations();

  const IconComponent = Icons[TIER_ICONS[currentTier]] as React.ComponentType<{ className: string }>;
  const benefits = TIER_REQUIREMENTS[currentTier].benefits;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-indigo-100 p-3">
            <IconComponent className="h-8 w-8 text-indigo-600" />
          </div>

          <div>
            <p className="text-sm text-gray-600">{t('rewards.your_tier')}</p>
            <h2 className="text-3xl font-bold text-gray-900 capitalize">
              {t(`tiers.${currentTier}`)}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('rewards.total_points', { points: totalPoints })}
            </p>
          </div>
        </div>

        <Badge className="text-lg px-4 py-2 capitalize">
          {t(`tiers.${currentTier}`)}
        </Badge>
      </div>

      {showBenefits && benefits.features.length > 0 && (
        <div className="mt-6 pt-6 border-t border-indigo-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {t('rewards.benefits')}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {benefits.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                <span className="text-sm text-gray-700">
                  {t(`tier_benefits.${feature}`)}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              <span className="text-sm text-gray-700">
                {t('tier_benefits.discount', { percent: benefits.discount })}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
