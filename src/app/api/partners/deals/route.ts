import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  getPartnerDeals,
  createDeal,
  hasValidCertification,
  hasSignedRequiredDocs,
  generateId,
  incrementAnnualMetric,
} from '@/lib/redis';
import { getPartnerDealsPaginated } from '@/lib/redis/operations/deals';
import { createPaginatedResponse } from '@/lib/redis/pagination';
import { checkAndAwardAchievement } from '@/lib/achievements';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { dealSchema } from '@/lib/validation/schemas';
import { ForbiddenError, ValidationError } from '@/lib/errors';
import { SECURITY_FEATURES } from '@/lib/config/features';
import type { Deal, GovernmentLevel } from '@/types';

export const GET = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    const { partner } = await requireSession();

    // Get pagination params from query string
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') ? parseInt(searchParams.get('cursor')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Use paginated version if cursor/limit provided
    if (cursor !== undefined || limit !== undefined) {
      const result = await getPartnerDealsPaginated(partner.id, { cursor, limit });
      return NextResponse.json(createPaginatedResponse(result));
    }

    // Fallback to legacy for backward compatibility
    const deals = await getPartnerDeals(partner.id);
    return NextResponse.json({ deals });
  }),
  RATE_LIMITS.LIST
);

export const POST = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    const { user, partner } = await requireSession();

    // Validate certification (can be disabled via ENFORCE_CERTIFICATION=false)
    if (SECURITY_FEATURES.ENFORCE_CERTIFICATION) {
      const hasCert = await hasValidCertification(user.id);
      if (!hasCert) {
        throw new ForbiddenError(
          'Necesitas una certificación activa para registrar deals'
        );
      }
    }

    // Validate legal documents (can be disabled via ENFORCE_LEGAL_DOCS=false)
    // Note: This check uses the legacy document system.
    // In the new V2 system, documents are partner-specific via DocuSign.
    if (SECURITY_FEATURES.ENFORCE_LEGAL_DOCS) {
      const hasLegal = await hasSignedRequiredDocs(user.id);
      if (!hasLegal) {
        throw new ForbiddenError(
          'Debes firmar todos los documentos legales requeridos antes de registrar deals'
        );
      }
    }

    const body = await request.json();
    const validation = dealSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      const errors: Record<string, string> = {};
      issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      throw new ValidationError('Validation failed', errors);
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
    const opportunitiesCount = await incrementAnnualMetric(
      partner.id,
      'opportunities',
      1
    );

    // Award opportunity achievements
    if (opportunitiesCount === 1) {
      await checkAndAwardAchievement(partner.id, 'first_opportunity');
    } else if (opportunitiesCount === 5) {
      await checkAndAwardAchievement(partner.id, 'five_opportunities');
    }

    logger.info('Deal created successfully', {
      dealId: deal.id,
      partnerId: partner.id,
      userId: user.id,
    });

    return NextResponse.json({ deal }, { status: 201 });
  }),
  RATE_LIMITS.CREATE
);
