import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { checkDomainConflict } from '@/lib/redis';
import { normalizeDomain } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await requireSession();

    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const normalizedDomain = normalizeDomain(domain);
    const conflictingDeals = await checkDomainConflict(normalizedDomain);

    return NextResponse.json({
      conflict: conflictingDeals.length > 0,
      dealIds: conflictingDeals,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Validate domain error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
