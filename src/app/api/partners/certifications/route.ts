import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getUserCertifications } from '@/lib/redis';

export async function GET() {
  try {
    const { user } = await requireSession();
    const certifications = await getUserCertifications(user.id);

    return NextResponse.json({ certifications });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Get certifications error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
