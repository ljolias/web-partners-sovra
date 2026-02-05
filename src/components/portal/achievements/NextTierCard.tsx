'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import type { NextTierRequirements } from '@/types/achievements';

interface NextTierCardProps {
  requirements: NextTierRequirements | null;
}

export function NextTierCard({ requirements }: NextTierCardProps) {
  const t = useTranslations();

  if (!requirements) {
    return (
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('rewards.platinum_achieved')}
          </h3>
          <p className="text-gray-600">
            {t('rewards.platinum_message')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-blue-200 bg-blue-50">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('rewards.next_tier')}
          </h3>
          <p className="text-sm text-gray-600 capitalize">
            {t('rewards.reach_tier', { tier: t(`tiers.${requirements.tier}`) })}
          </p>
        </div>

        {/* Rating Requirement */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              {t('rewards.rating_requirement')}
            </label>
            <span className="text-sm font-semibold text-gray-900">
              {requirements.rating.current} / {requirements.rating.required}
            </span>
          </div>
          <Progress value={(requirements.rating.current / requirements.rating.required) * 100} />
          {requirements.rating.met && (
            <p className="text-xs text-green-600 mt-1">✓ {t('common.complete')}</p>
          )}
        </div>

        {/* Achievement Requirements */}
        {requirements.achievements.remaining.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              {t('rewards.required_achievements')}
            </h4>
            <div className="space-y-2">
              {requirements.achievements.remaining.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-2">
                  <Circle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    {t(`${achievement.name}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Annual Requirements */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {t('rewards.annual_requirements')}
          </h4>
          <div className="space-y-2">
            {/* Certified Employees */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {requirements.annualRequirements.certifiedEmployees.met ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-gray-700">
                  {t('rewards.certified_employees')}
                </span>
              </div>
              <span className="font-semibold">
                {requirements.annualRequirements.certifiedEmployees.current} /
                {requirements.annualRequirements.certifiedEmployees.required}
              </span>
            </div>

            {/* Opportunities */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {requirements.annualRequirements.opportunities.met ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-gray-700">
                  {t('rewards.opportunities')}
                </span>
              </div>
              <span className="font-semibold">
                {requirements.annualRequirements.opportunities.current} /
                {requirements.annualRequirements.opportunities.required}
              </span>
            </div>

            {/* Deals Won */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {requirements.annualRequirements.dealsWon.met ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-gray-700">
                  {t('rewards.deals_won')}
                </span>
              </div>
              <span className="font-semibold">
                {requirements.annualRequirements.dealsWon.current} /
                {requirements.annualRequirements.dealsWon.required}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
