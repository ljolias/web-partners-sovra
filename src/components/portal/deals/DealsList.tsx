'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Badge, Card } from '@/components/ui';
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

  const stageVariants: Record<DealStage, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    registered: 'default',
    qualified: 'info',
    proposal: 'info',
    negotiation: 'warning',
    closed_won: 'success',
    closed_lost: 'danger',
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
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        </div>
        <Link href={`${basePath}/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('newDeal')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('list.search')}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                stageFilter === stage
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {stage === 'all' ? t('common.all') : t(`stages.${stage}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-gray-500">{t('list.empty')}</p>
        </Card>
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
                <Card hover className="h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {deal.companyName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{deal.contactName}</p>
                    </div>
                    <Badge variant={stageVariants[deal.stage]}>
                      {t(`stages.${deal.stage}`)}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Value</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(deal.dealValue, deal.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">MEDDIC</span>
                      <span className="font-medium text-gray-900">
                        {calculateMEDDICAverage(deal.meddic).toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created</span>
                      <span className="text-gray-600">{formatDate(deal.createdAt, locale)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
