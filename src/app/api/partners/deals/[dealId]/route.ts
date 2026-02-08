import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { logger } from '@/lib/logger';
import { NotFoundError, ForbiddenError, ValidationError } from '@/lib/errors';
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

export const GET = withRateLimit(
  withErrorHandling(async (
    _request: NextRequest,
    { params }: { params: Promise<{ dealId: string }> }
  ) => {
    const { partner } = await requireSession();
    const { dealId } = await params;

    const deal = await getDeal(dealId);

    if (!deal) {
      throw new NotFoundError('Deal');
    }

    if (deal.partnerId !== partner.id) {
      throw new ForbiddenError('Access denied to this deal');
    }

    return NextResponse.json({ deal });
  }),
  RATE_LIMITS.READ
);

export const PUT = withRateLimit(
  withErrorHandling(async (
    request: NextRequest,
    { params }: { params: Promise<{ dealId: string }> }
  ) => {
    const { user, partner } = await requireSession();
    const { dealId } = await params;

    const deal = await getDeal(dealId);

    if (!deal) {
      throw new NotFoundError('Deal');
    }

    if (deal.partnerId !== partner.id) {
      throw new ForbiddenError('Access denied to this deal');
    }

    // Only allow updates for deals in pending_approval or more_info status
    if (deal.status !== 'pending_approval' && deal.status !== 'more_info') {
      throw new ValidationError('Cannot update deal in current status');
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      throw new ValidationError(issues[0]?.message || 'Validation failed');
    }

    // If updating from more_info, reset to pending_approval
    const updates = {
      ...validation.data,
      ...(deal.status === 'more_info' ? { status: 'pending_approval' as const } : {}),
      updatedAt: new Date().toISOString(),
    };

    await updateDeal(dealId, updates);
    const updatedDeal = await getDeal(dealId);

    logger.info('Deal updated', { dealId, partnerId: partner.id });

    return NextResponse.json({ deal: updatedDeal });
  }),
  RATE_LIMITS.UPDATE
);
