import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import {
  createQuote,
  getDeal,
  getPartnerQuotes,
  getNextQuoteVersion,
  generateId,
} from '@/lib/redis';
import type { Quote } from '@/types';

const quoteSchema = z.object({
  dealId: z.string().min(1, 'Deal ID is required'),
  products: z.object({
    sovraGov: z.object({
      included: z.boolean(),
      populationUsed: z.number(),
      pricePerInhabitant: z.number(),
      annualPrice: z.number(),
    }),
    sovraId: z.object({
      included: z.boolean(),
      plan: z.enum(['essentials', 'professional', 'enterprise']),
      monthlyLimit: z.number(),
      monthlyPrice: z.number(),
      annualPrice: z.number(),
    }),
  }),
  services: z.object({
    walletImplementation: z.boolean(),
    walletPrice: z.number(),
    integrationHours: z.number(),
    integrationPricePerHour: z.number(),
    integrationTotal: z.number(),
  }),
  discounts: z.object({
    partnerTier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
    partnerGeneratedLead: z.boolean(),
    baseDiscountPercent: z.number(),
    leadBonusPercent: z.number(),
    totalDiscountPercent: z.number(),
    discountAmount: z.number(),
  }),
  subtotal: z.number(),
  totalDiscount: z.number(),
  total: z.number(),
});

export async function GET() {
  try {
    const { partner } = await requireSession();
    const quotes = await getPartnerQuotes(partner.id);

    return NextResponse.json({ quotes });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Get quotes error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { partner } = await requireSession();

    const body = await request.json();
    const validation = quoteSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify deal exists and belongs to partner
    const deal = await getDeal(data.dealId);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }
    if (deal.partnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify deal is approved
    if (deal.status !== 'approved') {
      return NextResponse.json(
        { error: 'Can only create quotes for approved deals' },
        { status: 400 }
      );
    }

    // Get next version number
    const version = await getNextQuoteVersion(data.dealId);
    const now = new Date().toISOString();

    const quote: Quote = {
      id: generateId(),
      dealId: data.dealId,
      partnerId: partner.id,
      version,
      products: data.products,
      services: data.services,
      discounts: data.discounts,
      subtotal: data.subtotal,
      totalDiscount: data.totalDiscount,
      total: data.total,
      currency: 'USD',
      createdAt: now,
      updatedAt: now,
    };

    await createQuote(quote);

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Create quote error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
