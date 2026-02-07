import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { requireSession } from '@/lib/auth';
import { getLegalDocument, signLegalDocument, generateId } from '@/lib/redis';
import type { LegalSignature } from '@/types';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { user, partner } = await requireSession();

  const { documentId } = await request.json();

  if (!documentId) {
    throw new ValidationError('Document ID is required');
  }

  const document = await getLegalDocument(documentId);

  if (!document) {
    throw new NotFoundError('Document');
  }

  const ipAddress = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

  const signature: LegalSignature = {
    id: generateId(),
    documentId,
    userId: user.id,
    partnerId: partner.id,
    signedAt: new Date().toISOString(),
    ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
  };

  await signLegalDocument(signature);

  logger.info('Document signed', { documentId, userId: user.id, partnerId: partner.id });

  return NextResponse.json({ signature });
});
