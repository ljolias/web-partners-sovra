import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import {
  getAllPartners,
  getPartnersByStatus,
  getPartnersByTier,
  getPartnersByCountry,
  createPartner,
  getPartnerDeals,
  getPartnerCredentials,
  generateId,
  addAuditLog,
} from '@/lib/redis';
import type { Partner, PartnerTier } from '@/types';

// GET - List all partners (for Sovra Admin) with optional filters
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can access this
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query params for filters
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status') as 'active' | 'suspended' | null;
    const tierFilter = searchParams.get('tier') as PartnerTier | null;
    const countryFilter = searchParams.get('country');

    let partners: Partner[];

    // Apply filters if provided
    if (statusFilter) {
      partners = await getPartnersByStatus(statusFilter);
    } else if (tierFilter) {
      partners = await getPartnersByTier(tierFilter);
    } else if (countryFilter) {
      partners = await getPartnersByCountry(countryFilter);
    } else {
      partners = await getAllPartners();
    }

    // Apply additional filters
    if (statusFilter && !searchParams.get('status')) {
      partners = partners.filter(p => p.status === statusFilter);
    }
    if (tierFilter && !searchParams.get('tier')) {
      partners = partners.filter(p => p.tier === tierFilter);
    }
    if (countryFilter && !searchParams.get('country')) {
      partners = partners.filter(p => p.country === countryFilter);
    }

    // Enrich with additional stats
    const enrichedPartners = await Promise.all(
      partners.map(async (partner) => {
        const [deals, credentials] = await Promise.all([
          getPartnerDeals(partner.id),
          getPartnerCredentials(partner.id),
        ]);

        return {
          ...partner,
          totalDeals: deals.length,
          wonDeals: deals.filter(d => d.status === 'closed_won').length,
          usersCount: credentials.length,
          certificationsCount: credentials.filter(c => c.status === 'active').length,
        };
      })
    );

    // Sort by company name
    enrichedPartners.sort((a, b) =>
      (a.companyName || a.name || '').localeCompare(b.companyName || b.name || '')
    );

    return NextResponse.json({ partners: enrichedPartners });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Get partners error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new partner
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can create partners
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      companyName,
      country,
      tier,
      logoUrl,
      contactName,
      contactEmail,
      contactPhone,
    } = body;

    // Validation
    if (!companyName || !country || !tier || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: 'Campos requeridos: companyName, country, tier, contactName, contactEmail' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['bronze', 'silver', 'gold', 'platinum'].includes(tier)) {
      return NextResponse.json({ error: 'Nivel invalido' }, { status: 400 });
    }

    // Create partner
    const now = new Date().toISOString();
    const partner: Partner = {
      id: generateId(),
      companyName,
      country,
      tier,
      status: 'active',
      contactName,
      contactEmail,
      contactPhone: contactPhone || undefined,
      logoUrl: logoUrl || undefined,
      rating: 50, // Default rating
      totalDeals: 0,
      wonDeals: 0,
      totalRevenue: 0,
      createdAt: now,
      updatedAt: now,
    };

    await createPartner(partner);

    // Add audit log
    await addAuditLog(
      'partner.created',
      'partner',
      partner.id,
      { id: user.id, name: user.name, type: 'sovra_admin' },
      { entityName: partner.companyName }
    );

    return NextResponse.json({ partner }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Create partner error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
