'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui';
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

  const stageVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    registered: 'default',
    qualified: 'info',
    proposal: 'info',
    negotiation: 'warning',
    closed_won: 'success',
    closed_lost: 'danger',
  };

  if (deals.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-center text-gray-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="divide-y divide-gray-200">
        {deals.slice(0, 5).map((deal) => (
          <Link
            key={deal.id}
            href={`${basePath}/${deal.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{deal.companyName}</p>
              <p className="text-sm text-gray-500">
                {formatCurrency(deal.dealValue, deal.currency)} &middot;{' '}
                {formatDate(deal.createdAt, locale)}
              </p>
            </div>
            <Badge variant={stageVariants[deal.stage]}>
              {stageLabels[deal.stage]}
            </Badge>
          </Link>
        ))}
      </div>
      {deals.length > 5 && (
        <div className="border-t border-gray-200 p-4">
          <Link
            href={basePath}
            className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
