'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { RenewalStatus } from '@/types/achievements';

interface AnnualRenewalCardProps {
  status: RenewalStatus;
}

export function AnnualRenewalCard({ status }: AnnualRenewalCardProps) {
  const t = useTranslations();

  const renewalDate = new Date(status.nextRenewalDate);

  return (
    <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] card-hover-gradient">
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display text-[var(--color-text-primary)]">
          {t('rewards.annual_renewal')}
        </h3>

        {status.currentlyMeets ? (
          <Alert variant="success">
            {t('rewards.renewal_status_met')}
          </Alert>
        ) : (
          <Alert variant="warning">
            {t('rewards.renewal_status_at_risk')}
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-secondary)]">{t('rewards.renewal_date')}</p>
            <p className="font-semibold text-[var(--color-text-primary)]">
              {renewalDate.toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">{t('rewards.days_until_renewal')}</p>
            <p className={`font-semibold ${status.daysUntilRenewal <= 30 ? 'text-amber-400' : 'text-[var(--color-text-primary)]'}`}>
              {status.daysUntilRenewal} {t('common.days')}
            </p>
          </div>
        </div>

        <div className="space-y-2 bg-[var(--color-surface-hover)] p-3 rounded-lg border border-[var(--color-border)]">
          <p className="text-xs font-semibold text-[var(--color-text-primary)]">
            {t('rewards.current_requirements')}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                {t('rewards.certified_employees')}
              </span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {status.requirements.certifiedEmployees.current} /
                {status.requirements.certifiedEmployees.required}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                {t('rewards.opportunities')}
              </span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {status.requirements.opportunities.current} /
                {status.requirements.opportunities.required}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                {t('rewards.deals_won')}
              </span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {status.requirements.dealsWon.current} /
                {status.requirements.dealsWon.required}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
