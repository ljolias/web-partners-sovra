import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { processAllDueRenewals } from '@/lib/achievements/renewal';

/**
 * Cron endpoint for processing annual tier renewals
 *
 * This endpoint should be called monthly by Vercel Cron
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/tier-renewal",
 *     "schedule": "0 0 1 * *"  // 1st of each month at midnight UTC
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request from Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await processAllDueRenewals();

    return NextResponse.json({
      success: true,
      message: 'Tier renewal processing completed',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cron tier renewal error:', { error: error });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Allow manual trigger via POST (for testing)
 * Requires CRON_SECRET environment variable
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await processAllDueRenewals();

    return NextResponse.json({
      success: true,
      message: 'Tier renewal processing completed',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cron tier renewal error:', { error: error });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
