import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        role: sessionData.user.role,
      },
      partner: {
        id: sessionData.partner.id,
        name: sessionData.partner.name,
        companyName: sessionData.partner.companyName,
        tier: sessionData.partner.tier,
        rating: sessionData.partner.rating,
        status: sessionData.partner.status,
        certifications: sessionData.partner.certifications,
        legalDocsSignedAt: sessionData.partner.legalDocsSignedAt,
      },
    });
  } catch (error) {
    logger.error('Session error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
