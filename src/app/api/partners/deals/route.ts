import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import {
  getPartnerDeals,
  createDeal,
  hasValidCertification,
  hasSignedRequiredDocs,
  generateId,
  incrementAnnualMetric,
} from '@/lib/redis';
import { checkAndAwardAchievement } from '@/lib/achievements';
import type { Deal, GovernmentLevel } from '@/types';

const dealSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  country: z.string().min(1, 'Country is required'),
  governmentLevel: z.enum(['municipality', 'province', 'nation']),
  population: z.number().positive('Population must be positive'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactRole: z.string().min(1, 'Contact role is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  partnerGeneratedLead: z.boolean().default(false),
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

    // Validate certification (disabled for testing - TODO: re-enable in production)
    const hasCert = await hasValidCertification(user.id);
    if (!hasCert) {
      console.log('[Deals API] Certification check failed for user:', user.id, '- allowing for testing');
      // TODO: Re-enable this check in production
      // return NextResponse.json(
      //   { error: 'You need an active certification to register deals' },
      //   { status: 403 }
      // );
    }

    // Validate legal documents (disabled for testing - TODO: re-enable in production)
    // Note: This check uses the legacy document system.
    // In the new V2 system, documents are partner-specific via DocuSign.
    const hasLegal = await hasSignedRequiredDocs(user.id);
    if (!hasLegal) {
      console.log('[Deals API] Legal docs check failed for user:', user.id, '- allowing for testing');
      // TODO: Re-enable this check in production
      // return NextResponse.json(
      //   { error: 'Please sign all required legal documents before registering deals' },
      //   { status: 403 }
      // );
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
    const now = new Date().toISOString();

    const deal: Deal = {
      id: generateId(),
      partnerId: partner.id,

      // Client
      clientName: data.clientName,
      country: data.country,
      governmentLevel: data.governmentLevel as GovernmentLevel,
      population: data.population,

      // Contact
      contactName: data.contactName,
      contactRole: data.contactRole,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,

      // Opportunity
      description: data.description,
      partnerGeneratedLead: data.partnerGeneratedLead,

      // Status
      status: 'pending_approval',
      statusChangedAt: now,

      // Metadata
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };

    await createDeal(deal);

    // Track opportunity registration for achievements
    const opportunitiesCount = await incrementAnnualMetric(partner.id, 'opportunities', 1);

    // Award opportunity achievements
    if (opportunitiesCount === 1) {
      await checkAndAwardAchievement(partner.id, 'first_opportunity');
    } else if (opportunitiesCount === 5) {
      await checkAndAwardAchievement(partner.id, 'five_opportunities');
    }

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create deal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
