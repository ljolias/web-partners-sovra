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
      <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] card-hover-gradient">
        <div className="text-center">
          <h3 className="text-lg font-bold font-display text-[var(--color-text-primary)] mb-2">
            {t('rewards.platinum_achieved')}
          </h3>
          <p className="text-[var(--color-text-secondary)]">
            {t('rewards.platinum_message')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-[var(--color-primary)]/20 bg-[var(--color-surface)] card-hover-gradient">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold font-display text-[var(--color-text-primary)] mb-2">
            {t('rewards.next_tier')}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] capitalize">
            {t('rewards.reach_tier', { tier: t(`tiers.${requirements.tier}`) })}
          </p>
        </div>

        {/* Rating Requirement */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              {t('rewards.rating_requirement')}
            </label>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {requirements.rating.current} / {requirements.rating.required}
            </span>
          </div>
          <Progress value={(requirements.rating.current / requirements.rating.required) * 100} />
          {requirements.rating.met && (
            <p className="text-xs text-emerald-400 mt-1">✓ {t('common.complete')}</p>
          )}
        </div>

        {/* Achievement Requirements */}
        {requirements.achievements.remaining.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              {t('rewards.required_achievements')}
            </h4>
            <div className="space-y-2">
              {requirements.achievements.remaining.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-2">
                  <Circle className="h-4 w-4 text-[var(--color-text-secondary)]/40 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {achievement.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Annual Requirements */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            {t('rewards.annual_requirements')}
          </h4>
          <div className="space-y-2">
            {/* Certified Employees */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {requirements.annualRequirements.certifiedEmployees.met ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Circle className="h-4 w-4 text-[var(--color-text-secondary)]/40" />
                )}
                <span className="text-[var(--color-text-secondary)]">
                  {t('rewards.certified_employees')}
                </span>
              </div>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {requirements.annualRequirements.certifiedEmployees.current} /
                {requirements.annualRequirements.certifiedEmployees.required}
              </span>
            </div>

            {/* Opportunities */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {requirements.annualRequirements.opportunities.met ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Circle className="h-4 w-4 text-[var(--color-text-secondary)]/40" />
                )}
                <span className="text-[var(--color-text-secondary)]">
                  {t('rewards.opportunities')}
                </span>
              </div>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {requirements.annualRequirements.opportunities.current} /
                {requirements.annualRequirements.opportunities.required}
              </span>
            </div>

            {/* Deals Won */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {requirements.annualRequirements.dealsWon.met ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Circle className="h-4 w-4 text-[var(--color-text-secondary)]/40" />
                )}
                <span className="text-[var(--color-text-secondary)]">
                  {t('rewards.deals_won')}
                </span>
              </div>
              <span className="font-semibold text-[var(--color-text-primary)]">
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
