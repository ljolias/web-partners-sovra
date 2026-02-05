import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getSession,
  getUser,
  getPartner,
  createAuditLog,
  generateId,
} from '@/lib/redis/operations';
import { removeAchievement } from '@/lib/achievements/tracker';
import { recalculateAndUpdatePartner } from '@/lib/rating';
import { manualAchievementRevokeSchema } from '@/lib/rewards/schemas';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string; achievementId: string }> }
) {
  try {
    const user = await verifySovraAdmin();
    const { partnerId, achievementId } = await params;

    // Get partner
    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = manualAchievementRevokeSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    // Verify achievement exists
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    // Revoke achievement
    const removed = await removeAchievement(partnerId, achievementId);

    if (!removed) {
      return NextResponse.json(
        { error: 'Partner has not earned this achievement' },
        { status: 409 }
      );
    }

    // Recalculate rating
    try {
      await recalculateAndUpdatePartner(partnerId, user.id);
    } catch (error) {
      console.error(`Failed to recalculate rating for partner ${partnerId}:`, error);
    }

    // Create audit log
    await createAuditLog({
      id: generateId(),
      actorId: user.id,
      actorName: user.name,
      actorType: 'sovra_admin',
      action: 'partner.updated',
      entityType: 'partner',
      entityId: partnerId,
      entityName: partner.companyName,
      metadata: {
        manual: true,
        achievementId,
        achievementName: achievement.name,
        points: achievement.points,
        action: 'revoke',
        reason,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      partner: {
        id: partnerId,
        companyName: partner.companyName,
      },
      achievement: {
        id: achievementId,
        name: achievement.name,
        points: achievement.points,
        removed,
      },
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
    console.error('Revoke achievement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
