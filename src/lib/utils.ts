import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Re-export formatting utilities from centralized location
export {
  formatCurrency,
  formatCurrencyDetailed,
  formatDate,
  formatDateTime,
  formatDateShort,
  formatDuration,
  formatDurationSeconds,
  formatFileSize,
  formatPopulation,
  formatNumber,
  formatPercentage,
  formatRole,
  formatStatus,
  formatRelativeTime,
} from './utils/format';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getDomainFromEmail(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}

export function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
}

import type { MEDDICScores } from '@/types';

export function calculateMEDDICAverage(scores: MEDDICScores): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
