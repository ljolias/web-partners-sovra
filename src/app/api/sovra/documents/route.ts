import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from '@/lib/errors';
import { cookies } from 'next/headers';
import {
  getSession,
  getUser,
  getPartner,
  getAllLegalDocumentsV2,
  getPartnerLegalDocuments,
  createLegalDocumentV2,
  addDocumentAuditLog,
  generateId,
} from '@/lib/redis/operations';
import {
  uploadFileFromBuffer,
  validateFile,
  formatFileSize,
} from '@/lib/storage';
import { getCategoriesForActor } from '@/lib/docusign/templates';
import type { LegalDocument, DocumentCategory, UploadMetadata } from '@/types';

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

// GET - List documents (optionally filtered by partner)
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { user } = await requireSovraAdmin();

  const searchParams = request.nextUrl.searchParams;
  const partnerId = searchParams.get('partnerId');

  let documents: LegalDocument[];

  if (partnerId) {
    documents = await getPartnerLegalDocuments(partnerId);
  } else {
    documents = await getAllLegalDocumentsV2();
  }

  // Enrich with partner info
  const documentsWithPartner = await Promise.all(
    documents.map(async (doc) => {
      const partner = await getPartner(doc.partnerId);
      return {
        ...doc,
        partner: partner ? { id: partner.id, name: partner.companyName } : null,
      };
    })
  );

  // Get categories allowed for Sovra to share
  const allowedCategories = getCategoriesForActor('sovra');

  logger.debug('Documents retrieved', { count: documents.length, partnerId });

  return NextResponse.json({
    documents: documentsWithPartner,
    allowedCategories: allowedCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      requiresVerification: cat.requiresVerification,
    })),
  });
});

// POST - Share/upload a document to a partner
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { user } = await requireSovraAdmin();

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const partnerId = formData.get('partnerId') as string | null;
  const category = formData.get('category') as DocumentCategory | null;
  const title = formData.get('title') as string | null;
  const description = formData.get('description') as string | null;
  const expirationDate = formData.get('expirationDate') as string | null;

  // Validate required fields
  if (!file || !partnerId || !category || !title) {
    throw new ValidationError('File, partnerId, category, and title are required');
  }

  // Verify partner exists
  const partner = await getPartner(partnerId);
  if (!partner) {
    throw new NotFoundError('Partner');
  }

  // Validate category is allowed for Sovra
  const allowedCategories = getCategoriesForActor('sovra');
  const categoryConfig = allowedCategories.find((c) => c.id === category);

  if (!categoryConfig) {
    throw new ValidationError('Category not allowed');
  }

  // Validate file
  const validation = validateFile(file.name, file.type, file.size);
  if (!validation.valid) {
    throw new ValidationError(validation.error || 'Invalid file');
  }

  // Upload file to blob storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadResult = await uploadFileFromBuffer(
    buffer,
    partnerId,
    category,
    file.name,
    file.type
  );

  // Get IP and user agent for audit
  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Create document record
  const documentId = generateId();
  const now = new Date().toISOString();

  const uploadMetadata: UploadMetadata = {
    fileUrl: uploadResult.url,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    uploadedBy: 'sovra',
    uploadedByUserId: user.id,
    uploadedByName: user.name,
  };

  const document: LegalDocument = {
    id: documentId,
    partnerId,
    title,
    description: description || undefined,
    category,
    type: 'upload',
    uploadMetadata,
    status: 'active',
    version: 1,
    expirationDate: expirationDate || undefined,
    createdBy: user.id,
    createdByName: user.name,
    createdAt: now,
    updatedAt: now,
  };

  await createLegalDocumentV2(document);

  // Log audit event
  await addDocumentAuditLog(
    documentId,
    'shared',
    { type: 'sovra', id: user.id, name: user.name },
    {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      category,
      partnerId,
      partnerName: partner.companyName,
    },
    { ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0], userAgent }
  );

  logger.info('Document shared', { documentId, partnerId, category });

  return NextResponse.json({ document }, { status: 201 });
});
