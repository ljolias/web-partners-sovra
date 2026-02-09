import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { requireSession } from '@/lib/auth';
import {
  getDeal,
  updateDealStatus,
  dealHasQuote
} from '@/lib/redis/operations/deals';
import { dealStatusUpdateSchema } from '@/lib/validation/schemas';
import {
  requiresQuote,
  isPartnerChangeableStatus
} from '@/lib/deals/status-validation';
import { addAuditLog } from '@/lib/redis/operations/audit';
import { notifySovraAdmin } from '@/lib/notifications/sovra-admin';
import { ForbiddenError, ValidationError, NotFoundError } from '@/lib/errors';

export const PATCH = withRateLimit(
  withErrorHandling(async (
    request: NextRequest,
    { params }: { params: Promise<{ dealId: string }> }
  ) => {
    const { user, partner } = await requireSession();
    const { dealId } = await params;

    // Obtener deal
    const deal = await getDeal(dealId);
    if (!deal) throw new NotFoundError('Deal');

    // Verificar ownership
    if (deal.partnerId !== partner.id) {
      throw new ForbiddenError('Access denied');
    }

    // Validar permisos: solo creador O admin
    const isCreator = deal.createdBy === user.id;
    const isAdmin = user.role === 'admin';

    if (!isCreator && !isAdmin) {
      throw new ForbiddenError(
        'Solo el creador del deal o admin pueden cambiar el estado'
      );
    }

    // Validar request body
    const body = await request.json();
    const validation = dealStatusUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(validation.error.issues[0]?.message || 'Invalid input');
    }

    const { status: newStatus, notes } = validation.data;
    const currentStatus = deal.status;

    // Validar que el partner solo puede cambiar a estados post-aprobación
    if (!isPartnerChangeableStatus(newStatus)) {
      throw new ValidationError(
        'No puedes cambiar a este estado. Solo puedes usar estados post-aprobación.'
      );
    }

    // Validar requisito de cotización
    if (requiresQuote(newStatus)) {
      const hasQuote = await dealHasQuote(dealId);
      if (!hasQuote) {
        throw new ValidationError(
          'Debes crear una cotización antes de cambiar a este estado'
        );
      }
    }

    // Actualizar estado
    await updateDealStatus(
      dealId,
      newStatus,
      { id: user.id, name: user.name },
      { notes, hasQuote: await dealHasQuote(dealId) }
    );

    // Audit log
    await addAuditLog(
      'deal.status_changed',
      'deal',
      dealId,
      { id: user.id, name: user.name, type: 'partner' },
      {
        entityName: deal.clientName,
        changes: { status: { old: currentStatus, new: newStatus } },
        metadata: { notes }
      }
    );

    // Notificar Sovra Admin
    await notifySovraAdmin(deal, currentStatus, newStatus, user, notes);

    return NextResponse.json({ success: true });
  }),
  RATE_LIMITS.UPDATE
);
