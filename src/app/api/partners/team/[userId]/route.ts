import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import {
  getUser,
  getPartnerDeals,
  getUserCertifications,
  getAchievements,
} from '@/lib/redis';

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user: currentUser, partner } = await requireSession();
    const { userId } = await params;

    // Only partner admin can view team member details
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verify the user belongs to the same partner
    if (user.partnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all partner deals
    const allDeals = await getPartnerDeals(partner.id);

    // Filter deals created by this user
    const userDeals = allDeals.filter(deal => deal.createdBy === userId);

    // Get user's certifications
    const certifications = await getUserCertifications(userId);

    // Calculate stats
    const stats = {
      totalDeals: userDeals.length,
      pendingDeals: userDeals.filter(d => d.status === 'pending_approval' || d.status === 'more_info').length,
      approvedDeals: userDeals.filter(d => d.status === 'approved').length,
      wonDeals: userDeals.filter(d => d.status === 'won').length,
      lostDeals: userDeals.filter(d => d.status === 'lost').length,
      rejectedDeals: userDeals.filter(d => d.status === 'rejected').length,
      totalCertifications: certifications.length,
      activeCertifications: certifications.filter(c => c.status === 'active').length,
    };

    return NextResponse.json({
      user,
      deals: userDeals,
      certifications,
      stats,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Get team member details error:', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
