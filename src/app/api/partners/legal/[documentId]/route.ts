import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import { requireSession } from '@/lib/auth';
import {
  getLegalDocumentV2,
  getDocumentAuditEvents,
  addDocumentAuditLog,
} from '@/lib/redis';

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

// GET - Get document details with audit history
export const GET = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const { partner } = await requireSession();
  const { documentId } = await context.params;

  const document = await getLegalDocumentV2(documentId);

  if (!document) {
    throw new NotFoundError('Document');
  }

  // Verify partner owns this document
  if (document.partnerId !== partner.id) {
    throw new ForbiddenError('You do not have access to this document');
  }

  // Get audit events
  const auditEvents = await getDocumentAuditEvents(documentId);

  // Log view event
  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  await addDocumentAuditLog(
    documentId,
    'viewed',
    { type: 'partner' },
    {},
    { ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0], userAgent }
  );

  logger.debug('Document viewed', { documentId, partnerId: partner.id });

  return NextResponse.json({ document, auditEvents });
});
