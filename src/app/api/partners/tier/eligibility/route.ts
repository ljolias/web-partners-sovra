import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { calculateTierEligibility } from '@/lib/achievements';

export async function GET() {
  try {
    const { partner } = await requireSession();
    const eligibility = await calculateTierEligibility(partner.id);

    return NextResponse.json(eligibility);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Get tier eligibility error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
