import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getSession,
  getUser,
  createAuditLog,
  getAllPartners,
  generateId,
} from '@/lib/redis/operations';
import { getRewardsConfig, saveRewardsConfig } from '@/lib/redis/rewards';
import { rewardsConfigSchema } from '@/lib/rewards/schemas';
import { recalculateAndUpdatePartner } from '@/lib/rating';

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

export async function GET() {
  try {
    const user = await verifySovraAdmin();
    const config = await getRewardsConfig();

    return NextResponse.json({
      success: true,
      config,
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
    console.error('Get rewards config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifySovraAdmin();

    const body = await request.json();
    const validation = rewardsConfigSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const newConfig = validation.data;
    const currentConfig = await getRewardsConfig();

    // Track what changed
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    // Check achievement points changes
    for (const [id, achievement] of Object.entries(newConfig.achievements)) {
      const oldAchievement = currentConfig.achievements[id];
      if (oldAchievement && oldAchievement.points !== achievement.points) {
        changes[`achievement_${id}_points`] = {
          old: oldAchievement.points,
          new: achievement.points,
        };
      }
    }

    // Check tier requirements changes
    for (const [tier, requirement] of Object.entries(newConfig.tierRequirements)) {
      const oldRequirement = currentConfig.tierRequirements[tier as keyof typeof currentConfig.tierRequirements];
      if (oldRequirement) {
        if (oldRequirement.minRating !== requirement.minRating) {
          changes[`tier_${tier}_minRating`] = {
            old: oldRequirement.minRating,
            new: requirement.minRating,
          };
        }
        if (oldRequirement.benefits.discount !== requirement.benefits.discount) {
          changes[`tier_${tier}_discount`] = {
            old: oldRequirement.benefits.discount,
            new: requirement.benefits.discount,
          };
        }
      }
    }

    // Save new config with timestamp
    await saveRewardsConfig(
      {
        ...newConfig,
        lastUpdated: new Date().toISOString(),
        updatedBy: user.id,
      },
      user.id
    );

    // If achievement points changed, recalculate all partner ratings
    if (Object.keys(changes).some((k) => k.includes('achievement'))) {
      const partners = await getAllPartners(1000);
      for (const partner of partners) {
        try {
          await recalculateAndUpdatePartner(partner.id, user.id);
        } catch (error) {
          console.error(`Failed to recalculate rating for partner ${partner.id}:`, error);
        }
      }
    }

    // Create audit log
    await createAuditLog({
      id: generateId(),
      actorId: user.id,
      actorName: user.name,
      actorType: 'sovra_admin',
      action: 'pricing.updated',
      entityType: 'pricing',
      entityId: 'rewards:config',
      entityName: 'Rewards Configuration',
      changes: Object.keys(changes).length > 0 ? changes : undefined,
      metadata: {
        achievementCount: Object.keys(newConfig.achievements).length,
        tierCount: Object.keys(newConfig.tierRequirements).length,
      },
      timestamp: new Date().toISOString(),
    });

    const updatedConfig = await getRewardsConfig();
    return NextResponse.json({
      success: true,
      config: updatedConfig,
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
    console.error('Update rewards config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
