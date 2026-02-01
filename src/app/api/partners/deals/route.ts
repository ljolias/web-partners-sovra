import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import {
  getPartnerDeals,
  createDeal,
  checkDomainConflict,
  hasValidCertification,
  hasSignedRequiredDocs,
  generateId,
} from '@/lib/redis';
import { normalizeDomain } from '@/lib/utils';
import type { Deal, MEDDICScores } from '@/types';

const dealSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyDomain: z.string().min(1, 'Company domain is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional().default(''),
  dealValue: z.number().positive('Deal value must be positive'),
  currency: z.enum(['USD', 'EUR', 'BRL']).default('USD'),
  notes: z.string().optional().default(''),
});

export async function GET() {
  try {
    const { partner } = await requireSession();
    const deals = await getPartnerDeals(partner.id);

    return NextResponse.json({ deals });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get deals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, partner } = await requireSession();

    // Validate certification
    const hasCert = await hasValidCertification(user.id);
    if (!hasCert) {
      return NextResponse.json(
        { error: 'You need an active certification to register deals' },
        { status: 403 }
      );
    }

    // Validate legal documents
    const hasLegal = await hasSignedRequiredDocs(user.id);
    if (!hasLegal) {
      return NextResponse.json(
        { error: 'Please sign all required legal documents before registering deals' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = dealSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = validation.data;
    const normalizedDomain = normalizeDomain(data.companyDomain);

    // Check for domain conflicts
    const conflictingDeals = await checkDomainConflict(normalizedDomain);
    if (conflictingDeals.length > 0) {
      return NextResponse.json(
        { error: 'This domain is already registered by another partner' },
        { status: 409 }
      );
    }

    const now = new Date();
    const exclusivityDate = new Date(now);
    exclusivityDate.setDate(exclusivityDate.getDate() + 90);

    const defaultMEDDIC: MEDDICScores = {
      metrics: 1,
      economicBuyer: 1,
      decisionCriteria: 1,
      decisionProcess: 1,
      identifyPain: 1,
      champion: 1,
    };

    const deal: Deal = {
      id: generateId(),
      partnerId: partner.id,
      companyName: data.companyName,
      companyDomain: normalizedDomain,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      dealValue: data.dealValue,
      currency: data.currency,
      stage: 'registered',
      notes: data.notes,
      meddic: defaultMEDDIC,
      exclusivityExpiresAt: exclusivityDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await createDeal(deal);

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create deal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
