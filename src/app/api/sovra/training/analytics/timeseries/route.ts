/**
 * Training Analytics Time Series API Route
 * Provides time-series data for enrollment and completion charts
 *
 * GET /api/sovra/training/analytics/timeseries
 *
 * Authentication: Requires sovra_admin role
 *
 * Query Parameters:
 * - type (required): 'enrollments' | 'completions'
 * - startDate (optional): ISO string or 'YYYY-MM-DD' (default: 30 days ago)
 * - endDate (optional): ISO string or 'YYYY-MM-DD' (default: today)
 *
 * Response:
 * - 200: Time series data with summary statistics
 * - 400: Invalid parameters
 * - 401: Not authenticated
 * - 403: Forbidden (not sovra_admin)
 * - 500: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth/session';
import {
  getEnrollmentTimeSeries,
  getCompletionTimeSeries,
} from '@/lib/redis/training';
import type { TimeSeriesDataPoint } from '@/types';

// Validation constants
const VALID_TYPES = ['enrollments', 'completions'] as const;
const DEFAULT_DAYS_BACK = 30;
const MAX_DATE_RANGE_DAYS = 365;

type TimeSeriesType = typeof VALID_TYPES[number];

interface TimeSeriesSummary {
  total: number;
  average: number;
  peak: number;
  peakDate: string;
}

/**
 * Parse date string to YYYY-MM-DD format
 * Supports ISO strings and YYYY-MM-DD format
 */
function parseDate(dateString: string): string | null {
  // Try parsing as ISO string or YYYY-MM-DD
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return null;
  }

  // Return in YYYY-MM-DD format
  return date.toISOString().split('T')[0];
}

/**
 * Get default start date (30 days ago)
 */
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - DEFAULT_DAYS_BACK);
  return date.toISOString().split('T')[0];
}

/**
 * Get default end date (today)
 */
function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate the number of days between two dates
 */
function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate summary statistics from time series data
 */
function calculateSummary(data: TimeSeriesDataPoint[]): TimeSeriesSummary {
  if (data.length === 0) {
    return {
      total: 0,
      average: 0,
      peak: 0,
      peakDate: '',
    };
  }

  const total = data.reduce((sum, point) => sum + point.count, 0);
  const average = Math.round((total / data.length) * 10) / 10;

  // Find peak
  let peak = 0;
  let peakDate = '';
  for (const point of data) {
    if (point.count > peak) {
      peak = point.count;
      peakDate = point.date;
    }
  }

  return {
    total,
    average,
    peak,
    peakDate,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    let session;
    try {
      session = await requireSession();
    } catch (error) {
      logger.error('Authentication failed:', { error: error });
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Step 2: Check user role (must be sovra_admin)
    if (session.user.role !== 'sovra_admin') {
      logger.warn('Unauthorized analytics access attempt by user with role', { id: session.user.id, role: session.user.role });
      return NextResponse.json(
        { error: 'Forbidden: sovra_admin role required' },
        { status: 403 }
      );
    }

    // Step 3: Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;

    // Parse type parameter (required)
    const typeParam = searchParams.get('type');
    if (!typeParam) {
      return NextResponse.json(
        {
          error: 'Missing required parameter',
          message: 'type parameter is required',
        },
        { status: 400 }
      );
    }
    if (!VALID_TYPES.includes(typeParam as TimeSeriesType)) {
      return NextResponse.json(
        {
          error: 'Invalid type parameter',
          message: `type must be one of: ${VALID_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }
    const type = typeParam as TimeSeriesType;

    // Parse startDate parameter (optional, default to 30 days ago)
    const startDateParam = searchParams.get('startDate');
    let startDate: string;
    if (startDateParam) {
      const parsed = parseDate(startDateParam);
      if (!parsed) {
        return NextResponse.json(
          {
            error: 'Invalid startDate parameter',
            message: 'startDate must be a valid date in ISO format or YYYY-MM-DD',
          },
          { status: 400 }
        );
      }
      startDate = parsed;
    } else {
      startDate = getDefaultStartDate();
    }

    // Parse endDate parameter (optional, default to today)
    const endDateParam = searchParams.get('endDate');
    let endDate: string;
    if (endDateParam) {
      const parsed = parseDate(endDateParam);
      if (!parsed) {
        return NextResponse.json(
          {
            error: 'Invalid endDate parameter',
            message: 'endDate must be a valid date in ISO format or YYYY-MM-DD',
          },
          { status: 400 }
        );
      }
      endDate = parsed;
    } else {
      endDate = getDefaultEndDate();
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        {
          error: 'Invalid date range',
          message: 'startDate must be before or equal to endDate',
        },
        { status: 400 }
      );
    }

    // Validate date range doesn't exceed maximum
    const daysDiff = getDaysBetween(startDate, endDate);
    if (daysDiff > MAX_DATE_RANGE_DAYS) {
      return NextResponse.json(
        {
          error: 'Date range too large',
          message: `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days`,
        },
        { status: 400 }
      );
    }

    // Step 4: Fetch time series data based on type
    let timeSeriesData: TimeSeriesDataPoint[];

    if (type === 'enrollments') {
      timeSeriesData = await getEnrollmentTimeSeries(startDate, endDate);
    } else {
      timeSeriesData = await getCompletionTimeSeries(startDate, endDate);
    }

    // Step 5: Calculate summary statistics
    const summary = calculateSummary(timeSeriesData);

    // Step 6: Return response
    return NextResponse.json(
      {
        type,
        data: timeSeriesData,
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch-all error handler
    logger.error('Error fetching time series analytics:', { error: error });
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
