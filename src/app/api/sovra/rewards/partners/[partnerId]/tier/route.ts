import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import {
  getSession,
  getUser,
  getPartner,
  updatePartner,
  createAuditLog,
  generateId,
} from '@/lib/redis/operations';
import { recordTierChange } from '@/lib/redis/rewards';
import { manualTierChangeSchema } from '@/lib/rewards/schemas';
import { getTierRequirements } from '@/lib/achievements/tiers';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const user = await verifySovraAdmin();
    const { partnerId } = await params;

    // Get partner
    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = manualTierChangeSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { tier, reason, skipRequirements } = validation.data;

    // Verify tier exists
    const tierReqs = getTierRequirements(tier);
    if (!tierReqs) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const previousTier = partner.tier;
    if (previousTier === tier) {
      return NextResponse.json(
        { error: 'Partner is already at this tier' },
        { status: 400 }
      );
    }

    // Update partner tier
    await updatePartner(partnerId, {
      tier,
      updatedAt: new Date().toISOString(),
    });

    // Record tier change
    await recordTierChange(partnerId, tier, 'manual', previousTier);

    // Create audit log
    await createAuditLog({
      id: generateId(),
      actorId: user.id,
      actorName: user.name,
      actorType: 'sovra_admin',
      action: 'partner.tier_changed',
      entityType: 'partner',
      entityId: partnerId,
      entityName: partner.companyName,
      changes: {
        tier: {
          old: previousTier,
          new: tier,
        },
      },
      metadata: {
        reason,
        manualChange: true,
        skipRequirements: skipRequirements || false,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      partner: {
        id: partnerId,
        companyName: partner.companyName,
        previousTier,
        newTier: tier,
        changedAt: new Date().toISOString(),
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
    logger.error('Manual tier change error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
