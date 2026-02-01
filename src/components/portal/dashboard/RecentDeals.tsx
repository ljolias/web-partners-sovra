'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Deal } from '@/types';

interface RecentDealsProps {
  deals: Deal[];
  locale: string;
  viewAllLabel: string;
  emptyLabel: string;
  stageLabels: Record<string, string>;
}

export function RecentDeals({
  deals,
  locale,
  viewAllLabel,
  emptyLabel,
  stageLabels,
}: RecentDealsProps) {
  const basePath = `/${locale}/partners/portal/deals`;

  const stageColors: Record<string, string> = {
    registered: 'bg-[var(--color-neutral)]/10 text-[var(--color-neutral)] border-[var(--color-neutral)]/20',
    qualified: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20',
    proposal: 'bg-[var(--color-accent-purple)]/10 text-[var(--color-accent-purple)] border-[var(--color-accent-purple)]/20',
    negotiation: 'bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)] border-[var(--color-accent-orange)]/20',
    closed_won: 'bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)] border-[var(--color-accent-green)]/20',
    closed_lost: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  if (deals.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-center text-[var(--color-text-secondary)]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="divide-y divide-[var(--color-border)]">
        {deals.slice(0, 5).map((deal) => (
          <Link
            key={deal.id}
            href={`${basePath}/${deal.id}`}
            className="flex items-center justify-between p-3 sm:p-4 hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <div className="flex-1 min-w-0 mr-3">
              <p className="font-medium text-sm sm:text-base text-[var(--color-text-primary)] truncate">{deal.companyName}</p>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                {formatCurrency(deal.dealValue, deal.currency)} · {formatDate(deal.createdAt, locale)}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${stageColors[deal.stage]}`}>
              {stageLabels[deal.stage]}
            </span>
          </Link>
        ))}
      </div>
      {deals.length > 5 && (
        <div className="border-t border-[var(--color-border)] p-3 sm:p-4">
          <Link
            href={basePath}
            className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
