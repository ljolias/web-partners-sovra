import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { getDeal, updateDeal } from '@/lib/redis';
import { logRatingEvent, recalculateAndUpdatePartner } from '@/lib/rating';

const updateSchema = z.object({
  companyName: z.string().min(1).optional(),
  contactName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  dealValue: z.number().positive().optional(),
  currency: z.enum(['USD', 'EUR', 'BRL']).optional(),
  stage: z.enum(['registered', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const { partner } = await requireSession();
    const { dealId } = await params;

    const deal = await getDeal(dealId);

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (deal.partnerId !== partner.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ deal });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get deal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const { user, partner } = await requireSession();
    const { dealId } = await params;

    const deal = await getDeal(dealId);

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (deal.partnerId !== partner.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const previousStage = deal.stage;
    await updateDeal(dealId, validation.data);
    const updatedDeal = await getDeal(dealId);

    // Log stage change events
    if (validation.data.stage && validation.data.stage !== previousStage) {
      if (validation.data.stage === 'closed_won') {
        await logRatingEvent(
          partner.id,
          user.id,
          'DEAL_CLOSED_WON',
          { dealId, dealValue: updatedDeal?.dealValue }
        );
        // Recalculate rating after winning a deal
        await recalculateAndUpdatePartner(partner.id, user.id);
      } else if (validation.data.stage === 'closed_lost') {
        // Check if deal was poorly qualified (low MEDDIC score)
        const meddic = deal.meddic;
        const meddicTotal =
          meddic.metrics +
          meddic.economicBuyer +
          meddic.decisionCriteria +
          meddic.decisionProcess +
          meddic.identifyPain +
          meddic.champion;
        const meddicAvg = meddicTotal / 6;

        // If MEDDIC average is below 3, consider it poor qualification
        if (meddicAvg < 3) {
          await logRatingEvent(
            partner.id,
            user.id,
            'DEAL_CLOSED_LOST_POOR_QUALIFICATION',
            { dealId, meddicAvg }
          );
        }
        // Recalculate rating after losing a deal
        await recalculateAndUpdatePartner(partner.id, user.id);
      }
    }

    return NextResponse.json({ deal: updatedDeal });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update deal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
