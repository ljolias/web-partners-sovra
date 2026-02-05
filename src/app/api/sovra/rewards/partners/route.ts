import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession, getUser, getAllPartners, getPartnersByTier } from '@/lib/redis/operations';
import { getPartnerAchievements } from '@/lib/achievements/tracker';
import { getRewardsConfig } from '@/lib/redis/rewards';
import type { PartnerTier } from '@/types';

async function verifySovraAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('partner_session')?.value;

  if (!sessionId) {
    throw new Error('Unauthorized');
  }

  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Unauthorized');
  }

  const user = await getUser(session.userId);
  if (!user || user.role !== 'sovra_admin') {
    throw new Error('Forbidden');
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifySovraAdmin();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const tier = searchParams.get('tier') as PartnerTier | null;
    const country = searchParams.get('country');
    const sortBy = searchParams.get('sortBy') || 'points';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get partners
    let partners = tier ? await getPartnersByTier(tier) : await getAllPartners(limit + offset);

    // Filter by country if specified
    if (country) {
      partners = partners.filter((p) => p.country === country);
    }

    // Get rewards config for points calculation
    const config = await getRewardsConfig();

    // Enrich with achievement points
    const enrichedPartners = await Promise.all(
      partners.map(async (partner) => {
        const achievements = await getPartnerAchievements(partner.id);

        // Calculate total points and breakdown by category
        const pointsByCategory: Record<string, number> = {};
        let totalPoints = 0;

        for (const achievement of achievements) {
          const definition = config.achievements[achievement.id];
          if (definition) {
            const points = definition.points;
            pointsByCategory[definition.category] = (pointsByCategory[definition.category] || 0) + points;
            totalPoints += points;
          }
        }

        return {
          id: partner.id,
          companyName: partner.companyName,
          country: partner.country,
          tier: partner.tier,
          status: partner.status,
          rating: partner.rating,
          totalPoints,
          pointsByCategory,
          achievementCount: achievements.length,
          createdAt: partner.createdAt,
        };
      })
    );

    // Sort results
    enrichedPartners.sort((a, b) => {
      if (sortBy === 'points') {
        return b.totalPoints - a.totalPoints;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'name') {
        return a.companyName.localeCompare(b.companyName);
      }
      return 0;
    });

    // Apply pagination
    const paginatedPartners = enrichedPartners.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      partners: paginatedPartners,
      total: enrichedPartners.length,
      offset,
      limit,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Get partners with points error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
