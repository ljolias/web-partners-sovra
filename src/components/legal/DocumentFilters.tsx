'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DocumentCategory, DocumentStatus } from '@/types';

interface DocumentFiltersProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: DocumentCategory | 'all') => void;
  onStatusChange: (status: DocumentStatus | 'all') => void;
  selectedCategory: DocumentCategory | 'all';
  selectedStatus: DocumentStatus | 'all';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: any) => string;
}

const categories: Array<{ value: DocumentCategory | 'all'; labelKey: string }> = [
  { value: 'all', labelKey: 'all' },
  { value: 'contract', labelKey: 'categories.contract' },
  { value: 'amendment', labelKey: 'categories.amendment' },
  { value: 'compliance', labelKey: 'categories.compliance' },
  { value: 'financial', labelKey: 'categories.financial' },
  { value: 'certification', labelKey: 'categories.certification' },
  { value: 'policy', labelKey: 'categories.policy' },
  { value: 'correspondence', labelKey: 'categories.correspondence' },
];

const statuses: Array<{ value: DocumentStatus | 'all'; labelKey: string }> = [
  { value: 'all', labelKey: 'all' },
  { value: 'pending_signature', labelKey: 'status.pending_signature' },
  { value: 'partially_signed', labelKey: 'status.partially_signed' },
  { value: 'active', labelKey: 'status.active' },
  { value: 'expired', labelKey: 'status.expired' },
  { value: 'archived', labelKey: 'status.archived' },
];

export function DocumentFilters({
  onSearch,
  onCategoryChange,
  onStatusChange,
  selectedCategory,
  selectedStatus,
  t,
}: DocumentFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    onSearch('');
    onCategoryChange('all');
    onStatusChange('all');
  };

  const hasActiveFilters =
    searchQuery !== '' || selectedCategory !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          variant={showFilters ? 'primary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('filters')}
          {hasActiveFilters && (
            <Badge variant="primary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
              !
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-sm">
            {t('clearFilters')}
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {t('category')}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => onCategoryChange(cat.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    selectedCategory === cat.value
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  {t(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {t('statusLabel')}
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => onStatusChange(status.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    selectedStatus === status.value
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  {t(status.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
