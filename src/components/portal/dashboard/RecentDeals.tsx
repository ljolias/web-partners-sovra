'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Users, Building2 } from 'lucide-react';
import type { Deal } from '@/types';

interface RecentDealsProps {
  deals: Deal[];
  locale: string;
  viewAllLabel: string;
  emptyLabel: string;
}

const statusColors: Record<string, string> = {
  // Pre-approval statuses
  pending_approval: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  more_info: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  // Post-quote statuses
  negotiation: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  contracting: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  awarded: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  won: 'bg-green-600/10 text-green-700 border-green-600/20',
  lost: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  // Old schema stages (for backwards compatibility)
  registered: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  qualified: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  proposal: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const statusLabels: Record<string, string> = {
  // Pre-approval statuses
  pending_approval: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  more_info: 'Mas Info',
  // Post-quote statuses
  negotiation: 'Negociacion',
  contracting: 'Contratacion',
  awarded: 'Adjudicada',
  won: 'Ganada',
  lost: 'Perdida',
  // Old schema stages (for backwards compatibility)
  registered: 'Registrado',
  qualified: 'Calificado',
  proposal: 'Propuesta',
};

export function RecentDeals({
  deals,
  locale,
  viewAllLabel,
  emptyLabel,
}: RecentDealsProps) {
  const basePath = `/${locale}/partners/portal/deals`;

  const formatPopulation = (pop: number | undefined): string => {
    if (pop === undefined || pop === null) return 'N/A';
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${Math.round(pop / 1000)}K`;
    return pop.toString();
  };

  // Helper to get display name (supports both old and new schema)
  const getDisplayName = (deal: Deal & { companyName?: string }): string => {
    return deal.clientName || (deal as any).companyName || 'Sin nombre';
  };

  // Helper to get status/stage (supports both old and new schema)
  const getStatus = (deal: Deal & { stage?: string }): string => {
    return deal.status || (deal as any).stage || 'pending_approval';
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
        {deals.slice(0, 5).map((deal) => {
          const status = getStatus(deal);
          const hasNewSchema = 'population' in deal && deal.population !== undefined;

          return (
            <Link
              key={deal.id}
              href={`${basePath}/${deal.id}`}
              className="flex items-center justify-between p-3 sm:p-4 hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-sm sm:text-base text-[var(--color-text-primary)] truncate">
                  {getDisplayName(deal)}
                </p>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                  {hasNewSchema ? (
                    <>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {deal.country || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatPopulation(deal.population)} hab.
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {(deal as any).companyDomain || deal.contactEmail}
                    </span>
                  )}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${statusColors[status] || statusColors.pending_approval}`}>
                {statusLabels[status] || status}
              </span>
            </Link>
          );
        })}
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
