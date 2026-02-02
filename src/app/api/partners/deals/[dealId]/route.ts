import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { getDeal, updateDeal } from '@/lib/redis';

const updateSchema = z.object({
  clientName: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  governmentLevel: z.enum(['municipality', 'province', 'nation']).optional(),
  population: z.number().positive().optional(),
  contactName: z.string().min(1).optional(),
  contactRole: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  description: z.string().optional(),
  partnerGeneratedLead: z.boolean().optional(),
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

    // Only allow updates for deals in pending_approval or more_info status
    if (deal.status !== 'pending_approval' && deal.status !== 'more_info') {
      return NextResponse.json(
        { error: 'Cannot update deal in current status' },
        { status: 400 }
      );
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

    // If updating from more_info, reset to pending_approval
    const updates = {
      ...validation.data,
      ...(deal.status === 'more_info' ? { status: 'pending_approval' as const } : {}),
      updatedAt: new Date().toISOString(),
    };

    await updateDeal(dealId, updates);
    const updatedDeal = await getDeal(dealId);

    return NextResponse.json({ deal: updatedDeal });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update deal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
