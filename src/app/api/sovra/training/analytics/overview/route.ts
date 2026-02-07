/**
 * Training Analytics Overview API Route
 * Provides high-level training metrics dashboard data
 *
 * GET /api/sovra/training/analytics/overview
 *
 * Authentication: Requires sovra_admin role
 * Query Parameters: None
 *
 * Response:
 * - 200: Overview metrics combined with credential stats
 * - 401: Not authenticated
 * - 403: Forbidden (not sovra_admin)
 * - 500: Internal server error
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth/session';
import {
  getTrainingOverviewMetrics,
  getCredentialClaimAnalytics,
} from '@/lib/redis/training';

// Cache duration in seconds (5 minutes)
const CACHE_MAX_AGE = 300;

export async function GET() {
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

    // Step 3: Fetch overview metrics and credential analytics in parallel
    const [overviewMetrics, credentialAnalytics] = await Promise.all([
      getTrainingOverviewMetrics(),
      getCredentialClaimAnalytics(),
    ]);

    // Step 4: Combine results into response
    const response = {
      totalCourses: overviewMetrics.totalCourses,
      publishedCourses: overviewMetrics.publishedCourses,
      draftCourses: overviewMetrics.draftCourses,
      totalEnrollments: overviewMetrics.totalEnrollments,
      averageCompletionRate: overviewMetrics.averageCompletionRate,
      totalCertifications: overviewMetrics.totalCertifications,
      credentialStats: {
        totalIssued: credentialAnalytics.totalIssued,
        totalClaimed: credentialAnalytics.totalClaimed,
        claimRate: credentialAnalytics.claimRate,
        averageClaimTimeHours: credentialAnalytics.averageClaimTimeHours,
        pending: credentialAnalytics.pending,
        expiringIn30Days: credentialAnalytics.expiringIn30Days,
      },
    };

    // Step 5: Return response with cache headers
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': `private, max-age=${CACHE_MAX_AGE}`,
      },
    });
  } catch (error) {
    // Catch-all error handler
    logger.error('Error fetching analytics overview:', { error: error });
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
