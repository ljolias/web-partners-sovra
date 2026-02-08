'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Search, MapPin, Users, Building2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import type { Deal, DealStatus, User as UserType } from '@/types';

interface DealsListProps {
  deals: ExtendedDeal[];
  users: UserType[];
  locale: string;
}

const governmentLevelLabels: Record<string, string> = {
  municipality: 'Municipio',
  province: 'Provincia',
  nation: 'Nacional',
};

// Extended Deal type for backward compatibility
interface ExtendedDeal extends Deal {
  companyName?: string;
  stage?: string;
  companyDomain?: string;
}

// Helper to get display name (supports both old and new schema)
const getDisplayName = (deal: ExtendedDeal): string => {
  return deal.clientName || deal.companyName || 'Sin nombre';
};

// Helper to get status/stage (supports both old and new schema)
const getStatus = (deal: ExtendedDeal): string => {
  return deal.status || deal.stage || 'pending_approval';
};

export const DealsList = memo(function DealsList({ deals, users, locale }: DealsListProps) {
  const t = useTranslations('deals');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'all'>('all');

  const basePath = useMemo(() => `/${locale}/partners/portal/deals`, [locale]);

  // Create user lookup map
  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach(user => {
      map.set(user.id, user.name);
    });
    return map;
  }, [users]);

  const statusColors: Record<string, string> = useMemo(() => ({
    // New schema statuses
    pending_approval: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
    more_info: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    closed_won: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    closed_lost: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    // Old schema stages (for backwards compatibility)
    registered: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    qualified: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    proposal: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    negotiation: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  }), []);

  const statusLabels: Record<string, string> = useMemo(() => ({
    // New schema statuses
    pending_approval: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    more_info: 'Mas Info',
    closed_won: 'Ganada',
    closed_lost: 'Perdida',
    // Old schema stages (for backwards compatibility)
    registered: 'Registrado',
    qualified: 'Calificado',
    proposal: 'Propuesta',
    negotiation: 'Negociacion',
  }), []);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const displayName = getDisplayName(deal);
      const contactName = deal.contactName || '';
      const country = deal.country || deal.companyDomain || '';
      const status = getStatus(deal);

      const matchesSearch =
        displayName.toLowerCase().includes(search.toLowerCase()) ||
        contactName.toLowerCase().includes(search.toLowerCase()) ||
        country.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [deals, search, statusFilter]);

  const statuses: (DealStatus | 'all')[] = useMemo(() => [
    'all',
    'pending_approval',
    'approved',
    'rejected',
    'more_info',
    'closed_won',
    'closed_lost',
  ], []);

  const formatPopulation = useCallback((pop: number | undefined): string => {
    if (pop === undefined || pop === null) return 'N/A';
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${Math.round(pop / 1000)}K`;
    return pop.toString();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
        </div>
        <Link href={`${basePath}/new`}>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:opacity-90">
            <Plus className="h-4 w-4" />
            {t('newDeal')}
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('list.search')}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-4 py-2.5 sm:py-3 text-[var(--color-text-primary)] placeholder-[var(--color-neutral-dark)] outline-none transition-all focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {status === 'all' ? t('common.all') : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-12 text-center">
          <p className="text-[var(--color-text-secondary)]">{t('list.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal, index) => {
            const displayName = getDisplayName(deal);
            const status = getStatus(deal);
            const hasNewSchema = 'population' in deal && deal.population !== undefined;

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`${basePath}/${deal.id}`}>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 h-full transition-all hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text-primary)] truncate">
                          {displayName}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] truncate">
                          {hasNewSchema
                            ? governmentLevelLabels[deal.governmentLevel] || deal.governmentLevel
                            : (deal as any).companyDomain || deal.contactEmail
                          }
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border shrink-0 ${statusColors[status] || statusColors.pending_approval}`}>
                        {statusLabels[status] || status}
                      </span>
                    </div>

                    <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                      {hasNewSchema ? (
                        <>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Pais
                            </span>
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {deal.country || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Poblacion
                            </span>
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {formatPopulation(deal.population)} hab.
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            Contacto
                          </span>
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {deal.contactName}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-[var(--color-text-secondary)]">Creado</span>
                        <span className="text-[var(--color-text-secondary)]">{formatDate(deal.createdAt, locale)}</span>
                      </div>
                      {deal.createdBy && (
                        <div className="flex justify-between text-xs sm:text-sm pt-1 border-t border-[var(--color-border)]">
                          <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Registrado por
                          </span>
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {userMap.get(deal.createdBy) || 'Desconocido'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quote button for approved deals */}
                    {status === 'approved' && (
                      <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                        <span className="text-xs text-green-600 font-medium">
                          Lista para cotizar
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
});
