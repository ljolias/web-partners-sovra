/**
 * Training System Helper Functions
 * Utility functions used across training analytics modules
 */

import type { LocalizedString } from '@/types';

/**
 * Safely parse a number from Redis string value
 */
export function safeParseNumber(
  value: unknown,
  defaultValue: number = 0
): number {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Safely parse JSON from Redis string value
 */
export function safeParseJSON<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Generate array of dates between start and end (inclusive)
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return dates;
  }

  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Calculate percentage safely (avoids division by zero)
 */
export function calculatePercentage(
  numerator: number,
  denominator: number,
  decimals: number = 2
): number {
  if (denominator === 0) return 0;
  const percentage = (numerator / denominator) * 100;
  return Math.round(percentage * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Get localized name from LocalizedString object
 */
export function getLocalizedName(
  localized: LocalizedString | undefined,
  fallback: string = ''
): string {
  if (!localized) return fallback;
  return localized.en || localized.es || localized.pt || fallback;
}
