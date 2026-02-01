import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { getDeal, updateDeal } from '@/lib/redis';

const meddicSchema = z.object({
  metrics: z.number().min(1).max(5).optional(),
  economicBuyer: z.number().min(1).max(5).optional(),
  decisionCriteria: z.number().min(1).max(5).optional(),
  decisionProcess: z.number().min(1).max(5).optional(),
  identifyPain: z.number().min(1).max(5).optional(),
  champion: z.number().min(1).max(5).optional(),
});

export async function PUT(
  request: NextRequest,
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

    const body = await request.json();
    const validation = meddicSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const updatedMeddic = {
      ...deal.meddic,
      ...validation.data,
    };

    await updateDeal(dealId, { meddic: updatedMeddic });
    const updatedDeal = await getDeal(dealId);

    return NextResponse.json({ deal: updatedDeal });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update MEDDIC error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
