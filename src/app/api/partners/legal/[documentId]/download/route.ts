import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { NotFoundError, ForbiddenError, ValidationError } from '@/lib/errors';
import { requireSession } from '@/lib/auth';
import {
  getLegalDocumentV2,
  addDocumentAuditLog,
} from '@/lib/redis';
import { getSignedDocument, getSigningCertificate } from '@/lib/docusign';

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

// GET - Download document file
export const GET = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const { user, partner } = await requireSession();
  const { documentId } = await context.params;

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'document'; // 'document' or 'certificate'

  const document = await getLegalDocumentV2(documentId);

  if (!document) {
    throw new NotFoundError('Document');
  }

  // Verify partner owns this document
  if (document.partnerId !== partner.id) {
    throw new ForbiddenError('You do not have access to this document');
  }

  // Get IP and user agent for audit
  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  let fileBuffer: Buffer;
  let fileName: string;
  let contentType: string;

  if (document.type === 'docusign' && document.docusignMetadata) {
    // DocuSign document - fetch from DocuSign API
    if (type === 'certificate') {
      fileBuffer = await getSigningCertificate(document.docusignMetadata.envelopeId);
      fileName = `${document.title}_certificate.pdf`;
    } else {
      fileBuffer = await getSignedDocument(document.docusignMetadata.envelopeId);
      fileName = `${document.title}.pdf`;
    }
    contentType = 'application/pdf';
  } else if (document.type === 'upload' && document.uploadMetadata) {
    // Uploaded document - redirect to blob URL or fetch
    const fileUrl = document.uploadMetadata.fileUrl;

    // Fetch the file from blob storage
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file from storage');
    }

    const arrayBuffer = await response.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
    fileName = document.uploadMetadata.fileName;
    contentType = document.uploadMetadata.mimeType;
  } else {
    throw new ValidationError('Document has no downloadable content');
  }

  // Log download event
  await addDocumentAuditLog(
    documentId,
    'downloaded',
    { type: 'partner', id: user.id, name: user.name },
    { downloadType: type },
    { ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0], userAgent }
  );

  logger.info('Document downloaded', { documentId, userId: user.id, partnerId: partner.id, type });

  // Return file as download
  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': fileBuffer.length.toString(),
    },
  });
});
