import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/errors';
import { cookies } from 'next/headers';
import {
  getSession,
  getUser,
  getLegalDocumentV2,
  getDocumentAuditEvents,
  getPartner,
} from '@/lib/redis/operations';

// Helper to verify Sovra admin
async function requireSovraAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('partner_session')?.value;

  if (!sessionId) {
    throw new UnauthorizedError();
  }

  const session = await getSession(sessionId);
  if (!session) {
    throw new UnauthorizedError();
  }

  const user = await getUser(session.userId);
  if (!user || user.role !== 'sovra_admin') {
    throw new ForbiddenError('Only Sovra Admin can access this resource');
  }

  return { user, session };
}

interface RouteParams {
  params: Promise<{ documentId: string }>;
}

// GET - Get document details with audit events
export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  await requireSovraAdmin();
  const { documentId } = await params;

  const document = await getLegalDocumentV2(documentId);
  if (!document) {
    throw new NotFoundError('Document');
  }

  // Get audit events
  const auditEvents = await getDocumentAuditEvents(documentId);

  // Get partner info
  const partner = await getPartner(document.partnerId);

  logger.debug('Document retrieved', { documentId });

  return NextResponse.json({
    document: {
      ...document,
      partner: partner ? { id: partner.id, name: partner.companyName } : null,
    },
    auditEvents,
  });
});
