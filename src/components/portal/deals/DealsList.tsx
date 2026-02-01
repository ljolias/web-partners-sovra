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

  // Sovra brand colors for stages
  const stageColors: Record<string, string> = {
    registered: 'bg-[#888888]/10 text-[#888888] border-[#888888]/20',
    qualified: 'bg-[#0099ff]/10 text-[#0099ff] border-[#0099ff]/20',
    proposal: 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20',
    negotiation: 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20',
    closed_won: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
    closed_lost: 'bg-red-500/10 text-red-400 border-red-500/20',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        </div>
        <Link href={`${basePath}/new`}>
          <button className="flex items-center gap-2 rounded-xl bg-[#0099ff] px-4 py-2.5 text-sm font-semibold !text-white shadow-lg shadow-[#0099ff]/20 transition-all hover:bg-[#0099ff]/90">
            <Plus className="h-4 w-4" />
            {t('newDeal')}
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('list.search')}
            className="w-full rounded-xl border border-white/5 bg-[#0f0d1a] pl-11 pr-4 py-3 text-white placeholder-[#444444] outline-none transition-all focus:border-[#0099ff]/50 focus:ring-2 focus:ring-[#0099ff]/20"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                stageFilter === stage
                  ? 'bg-[#0099ff]/10 text-[#0099ff] border border-[#0099ff]/20'
                  : 'bg-white/5 text-[#888888] border border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              {stage === 'all' ? t('common.all') : t(`stages.${stage}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#0f0d1a] py-12 text-center">
          <p className="text-[#888888]">{t('list.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`${basePath}/${deal.id}`}>
                <div className="rounded-2xl border border-white/5 bg-[#0f0d1a] p-5 h-full transition-all hover:border-white/10 hover:bg-[#0f0d1a]/80">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {deal.companyName}
                      </h3>
                      <p className="text-sm text-[#888888] truncate">{deal.contactName}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${stageColors[deal.stage]}`}>
                      {t(`stages.${deal.stage}`)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888888]">Value</span>
                      <span className="font-medium text-white">
                        {formatCurrency(deal.dealValue, deal.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888888]">MEDDIC</span>
                      <span className="font-medium text-white">
                        {calculateMEDDICAverage(deal.meddic).toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888888]">Created</span>
                      <span className="text-[#888888]">{formatDate(deal.createdAt, locale)}</span>
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
