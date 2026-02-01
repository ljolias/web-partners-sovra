'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, calculateMEDDICAverage } from '@/lib/utils';
import type { Deal, DealStage } from '@/types';

interface DealsListProps {
  deals: Deal[];
  locale: string;
}

export function DealsList({ deals, locale }: DealsListProps) {
  const t = useTranslations('deals');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<DealStage | 'all'>('all');

  const basePath = `/${locale}/partners/portal/deals`;

  const stageColors: Record<string, string> = {
    registered: 'bg-[var(--color-neutral)]/10 text-[var(--color-neutral)] border-[var(--color-neutral)]/20',
    qualified: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20',
    proposal: 'bg-[var(--color-accent-purple)]/10 text-[var(--color-accent-purple)] border-[var(--color-accent-purple)]/20',
    negotiation: 'bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)] border-[var(--color-accent-orange)]/20',
    closed_won: 'bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)] border-[var(--color-accent-green)]/20',
    closed_lost: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.companyName.toLowerCase().includes(search.toLowerCase()) ||
      deal.contactName.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const stages: (DealStage | 'all')[] = [
    'all',
    'registered',
    'qualified',
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost',
  ];

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
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                stageFilter === stage
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {stage === 'all' ? t('common.all') : t(`stages.${stage}`)}
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
          {filteredDeals.map((deal, index) => (
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
                        {deal.companyName}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] truncate">{deal.contactName}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border shrink-0 ${stageColors[deal.stage]}`}>
                      {t(`stages.${deal.stage}`)}
                    </span>
                  </div>

                  <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[var(--color-text-secondary)]">Value</span>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {formatCurrency(deal.dealValue, deal.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[var(--color-text-secondary)]">MEDDIC</span>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {calculateMEDDICAverage(deal.meddic).toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[var(--color-text-secondary)]">Created</span>
                      <span className="text-[var(--color-text-secondary)]">{formatDate(deal.createdAt, locale)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
