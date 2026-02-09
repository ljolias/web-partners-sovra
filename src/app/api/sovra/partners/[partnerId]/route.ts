import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import {
  getPartner,
  updatePartner,
  getPartnerDeals,
  getPartnerCredentials,
  getPartnerLegalDocuments,
  getPartnerStats,
  getPartnerUsers,
  getPartnerQuotes,
  addAuditLog,
} from '@/lib/redis';
import type { PartnerTier } from '@/types';

interface RouteParams {
  params: Promise<{ partnerId: string }>;
}

// GET - Get partner detail
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { partnerId } = await params;

    // Only Sovra Admin can access this
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner no encontrado' }, { status: 404 });
    }

    // Fetch related data
    const [deals, credentials, documents, stats, users, quotes] = await Promise.all([
      getPartnerDeals(partnerId),
      getPartnerCredentials(partnerId),
      getPartnerLegalDocuments(partnerId),
      getPartnerStats(partnerId),
      getPartnerUsers(partnerId),
      getPartnerQuotes(partnerId),
    ]);

    // Create a map of dealId -> quote for quick lookup
    const dealQuoteMap = new Map();
    for (const quote of quotes) {
      // Store the latest quote for each deal
      if (!dealQuoteMap.has(quote.dealId) || quote.version > dealQuoteMap.get(quote.dealId).version) {
        dealQuoteMap.set(quote.dealId, quote);
      }
    }

    // Add quote info to each deal
    const dealsWithQuotes = deals.map(deal => ({
      ...deal,
      quoteTotal: dealQuoteMap.has(deal.id) ? dealQuoteMap.get(deal.id).total : null,
      quoteCurrency: dealQuoteMap.has(deal.id) ? dealQuoteMap.get(deal.id).currency : null,
    }));

    return NextResponse.json({
      partner,
      deals: dealsWithQuotes,
      credentials,
      documents,
      stats,
      users,
      quotes,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Get partner error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update partner
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { partnerId } = await params;

    // Only Sovra Admin can update partners
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner no encontrado' }, { status: 404 });
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

    // Build updates object
    const updates: Record<string, unknown> = {};
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (companyName && companyName !== partner.companyName) {
      updates.companyName = companyName;
      changes.companyName = { old: partner.companyName, new: companyName };
    }
    if (country && country !== partner.country) {
      updates.country = country;
      changes.country = { old: partner.country, new: country };
    }
    if (tier && tier !== partner.tier) {
      if (!['bronze', 'silver', 'gold', 'platinum'].includes(tier)) {
        return NextResponse.json({ error: 'Nivel invalido' }, { status: 400 });
      }
      updates.tier = tier as PartnerTier;
      changes.tier = { old: partner.tier, new: tier };
    }
    if (logoUrl !== undefined && logoUrl !== partner.logoUrl) {
      updates.logoUrl = logoUrl || undefined;
      changes.logoUrl = { old: partner.logoUrl, new: logoUrl };
    }
    if (contactName && contactName !== partner.contactName) {
      updates.contactName = contactName;
      changes.contactName = { old: partner.contactName, new: contactName };
    }
    if (contactEmail && contactEmail !== partner.contactEmail) {
      updates.contactEmail = contactEmail;
      changes.contactEmail = { old: partner.contactEmail, new: contactEmail };
    }
    if (contactPhone !== undefined && contactPhone !== partner.contactPhone) {
      updates.contactPhone = contactPhone || undefined;
      changes.contactPhone = { old: partner.contactPhone, new: contactPhone };
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ partner, message: 'No hay cambios' });
    }

    await updatePartner(partnerId, updates);

    // Add audit log
    const action = changes.tier ? 'partner.tier_changed' : 'partner.updated';
    await addAuditLog(
      action,
      'partner',
      partnerId,
      { id: user.id, name: user.name, type: 'sovra_admin' },
      { entityName: partner.companyName, changes }
    );

    const updatedPartner = await getPartner(partnerId);

    return NextResponse.json({ partner: updatedPartner });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Update partner error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
