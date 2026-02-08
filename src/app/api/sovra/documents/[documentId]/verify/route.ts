import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { cookies } from 'next/headers';
import {
  getSession,
  getUser,
  getLegalDocumentV2,
  updateLegalDocumentV2,
  addDocumentAuditLog,
} from '@/lib/redis/operations';
import { getClientIp } from '@/lib/security/ip';

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

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

// POST - Verify or reject a document
export const POST = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const { user } = await requireSovraAdmin();
  const { documentId } = await context.params;

  const body = await request.json();
  const { action, notes } = body as { action: 'verify' | 'reject'; notes?: string };

  if (!action || !['verify', 'reject'].includes(action)) {
    throw new ValidationError('Action must be "verify" or "reject"');
  }

  const document = await getLegalDocumentV2(documentId);

  if (!document) {
    throw new NotFoundError('Document');
  }

  // Only uploaded documents can be verified
  if (document.type !== 'upload' || !document.uploadMetadata) {
    throw new ValidationError('Only uploaded documents can be verified');
  }

  // Get IP and user agent for audit
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const now = new Date().toISOString();

  // Update document verification status
  await updateLegalDocumentV2(documentId, {
    uploadMetadata: {
      ...document.uploadMetadata,
      verificationStatus: action === 'verify' ? 'verified' : 'rejected',
      verifiedBy: user.id,
      verifiedByName: user.name,
      verifiedAt: now,
      verificationNotes: notes,
    },
  });

  // Log audit event
  await addDocumentAuditLog(
    documentId,
    action === 'verify' ? 'verified' : 'rejected',
    { type: 'sovra', id: user.id, name: user.name },
    { notes },
    { ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0], userAgent }
  );

  // Fetch updated document
  const updatedDocument = await getLegalDocumentV2(documentId);

  logger.info('Document verification updated', { documentId, action });

  return NextResponse.json({
    document: updatedDocument,
    message: action === 'verify' ? 'Document verified successfully' : 'Document rejected',
  });
});
