/**
 * Training System Time Series Analytics
 * Functions for daily enrollment and completion tracking over time
 */

import { redis } from '../client';
import { trainingKeys } from './keys';
import { getDateRange, safeParseNumber } from './helpers';
import type { TimeSeriesDataPoint } from './types';

/**
 * Get daily enrollment counts within a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getDailyEnrollmentCounts(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  const dates = getDateRange(startDate, endDate);

  if (dates.length === 0) {
    return [];
  }

  const pipeline = redis.pipeline();
  for (const date of dates) {
    pipeline.get(trainingKeys.enrollmentByDate(date));
  }

  const results = await pipeline.exec();
  const timeSeries: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < dates.length; i++) {
    timeSeries.push({
      date: dates[i],
      count: safeParseNumber(results[i] as number | string | null),
    });
  }

  return timeSeries;
}

/**
 * Get daily completion counts within a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getDailyCompletionCounts(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  const dates = getDateRange(startDate, endDate);

  if (dates.length === 0) {
    return [];
  }

  const pipeline = redis.pipeline();
  for (const date of dates) {
    pipeline.get(trainingKeys.completionByDate(date));
  }

  const results = await pipeline.exec();
  const timeSeries: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < dates.length; i++) {
    timeSeries.push({
      date: dates[i],
      count: safeParseNumber(results[i] as number | string | null),
    });
  }

  return timeSeries;
}

/**
 * Get enrollment time series
 * Uses daily keys approach first, then falls back to sorted set if available
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getEnrollmentTimeSeries(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  const dailyCounts = await getDailyEnrollmentCounts(startDate, endDate);

  // If we have data from daily keys, return it
  if (dailyCounts.some((d) => d.count > 0)) {
    return dailyCounts;
  }

  // Fallback: use sorted set if available
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime() + 24 * 60 * 60 * 1000 - 1;

  const entries = await redis.zrange(
    trainingKeys.enrollmentTimeseries(),
    startTimestamp,
    endTimestamp,
    { byScore: true }
  );

  const dateMap = new Map<string, number>();
  const dates = getDateRange(startDate, endDate);

  for (const date of dates) {
    dateMap.set(date, 0);
  }

  if (entries && Array.isArray(entries)) {
    for (const entry of entries) {
      const entryStr = String(entry);
      const timestamp = parseInt(entryStr.split(':')[0]) || 0;
      if (timestamp > 0) {
        const date = new Date(timestamp).toISOString().split('T')[0];
        if (dateMap.has(date)) {
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }
      }
    }
  }

  return dates.map((date) => ({
    date,
    count: dateMap.get(date) || 0,
  }));
}

/**
 * Get completion time series
 * Uses daily keys approach first, then falls back to sorted set if available
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getCompletionTimeSeries(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  const dailyCounts = await getDailyCompletionCounts(startDate, endDate);

  if (dailyCounts.some((d) => d.count > 0)) {
    return dailyCounts;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime() + 24 * 60 * 60 * 1000 - 1;

  const entries = await redis.zrange(
    trainingKeys.completionTimeseries(),
    startTimestamp,
    endTimestamp,
    { byScore: true }
  );

  const dateMap = new Map<string, number>();
  const dates = getDateRange(startDate, endDate);

  for (const date of dates) {
    dateMap.set(date, 0);
  }

  if (entries && Array.isArray(entries)) {
    for (const entry of entries) {
      const entryStr = String(entry);
      const timestamp = parseInt(entryStr.split(':')[0]) || 0;
      if (timestamp > 0) {
        const date = new Date(timestamp).toISOString().split('T')[0];
        if (dateMap.has(date)) {
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }
      }
    }
  }

  return dates.map((date) => ({
    date,
    count: dateMap.get(date) || 0,
  }));
}
