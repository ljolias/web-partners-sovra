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

  // Sovra brand colors for stages
  const stageColors: Record<string, string> = {
    registered: 'bg-[#888888]/10 text-[#888888] border-[#888888]/20',
    qualified: 'bg-[#0099ff]/10 text-[#0099ff] border-[#0099ff]/20',
    proposal: 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20',
    negotiation: 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20',
    closed_won: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
    closed_lost: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  if (deals.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#0f0d1a] p-6">
        <p className="text-center text-[#888888]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0f0d1a] overflow-hidden">
      <div className="divide-y divide-white/5">
        {deals.slice(0, 5).map((deal) => (
          <Link
            key={deal.id}
            href={`${basePath}/${deal.id}`}
            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{deal.companyName}</p>
              <p className="text-sm text-[#888888]">
                {formatCurrency(deal.dealValue, deal.currency)} &middot;{' '}
                {formatDate(deal.createdAt, locale)}
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${stageColors[deal.stage]}`}>
              {stageLabels[deal.stage]}
            </span>
          </Link>
        ))}
      </div>
      {deals.length > 5 && (
        <div className="border-t border-white/5 p-4">
          <Link
            href={basePath}
            className="flex items-center justify-center gap-2 text-sm font-medium text-[#0099ff] hover:text-[#0099ff]/80 transition-colors"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
