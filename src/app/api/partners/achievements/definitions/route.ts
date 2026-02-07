import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getRewardsConfig } from '@/lib/redis/rewards';

/**
 * GET /api/partners/achievements/definitions
 * Returns achievement definitions from Redis configuration
 * This ensures partners portal always sees the latest admin-configured definitions
 */
export async function GET() {
  try {
    const config = await getRewardsConfig();

    return NextResponse.json({
      success: true,
      achievements: config.achievements,
      tierRequirements: config.tierRequirements,
    });
  } catch (error) {
    logger.error('Get achievement definitions error:', { error: error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
