import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';
import {
  getTeamPerformance,
  getTeamMembersPerformance,
  getTopPerformersByDeals,
  getTopPerformersByRevenue,
  getTopPerformersByCertifications,
  getTopPerformersByAchievements,
} from '@/lib/redis';

/**
 * GET /api/partners/team/analytics
 * Get team performance analytics
 * Only accessible by Partner Admin
 */
export const GET = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    const { user, partner } = await requireSession();

    // Only Partner Admin can view team analytics
    if (user.role !== 'admin') {
      throw new ForbiddenError('Only Partner Admin can view team analytics');
    }

    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'overview';

    let data: any = {};

    switch (view) {
      case 'overview':
        // Get overall team performance
        data = {
          performance: await getTeamPerformance(partner.id),
          topByDeals: await getTopPerformersByDeals(partner.id, 3),
          topByRevenue: await getTopPerformersByRevenue(partner.id, 3),
          topByCertifications: await getTopPerformersByCertifications(partner.id, 3),
        };
        break;

      case 'members':
        // Get detailed performance for all members
        data = {
          members: await getTeamMembersPerformance(partner.id),
        };
        break;

      case 'leaderboard':
        // Get full leaderboards
        data = {
          byDeals: await getTopPerformersByDeals(partner.id, 10),
          byRevenue: await getTopPerformersByRevenue(partner.id, 10),
          byCertifications: await getTopPerformersByCertifications(partner.id, 10),
          byAchievements: await getTopPerformersByAchievements(partner.id, 10),
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid view parameter' },
          { status: 400 }
        );
    }

    logger.debug('Team analytics retrieved', {
      partnerId: partner.id,
      view,
      userId: user.id,
    });

    return NextResponse.json(data);
  }),
  RATE_LIMITS.READ
);
