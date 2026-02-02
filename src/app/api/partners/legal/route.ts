import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  getAllLegalDocuments,
  getUserSignatures,
  getPartnerLegalDocuments,
  createLegalDocumentV2,
  addDocumentAuditLog,
  generateId,
} from '@/lib/redis';
import {
  uploadFileFromBuffer,
  validateFile,
  formatFileSize,
} from '@/lib/storage';
import { getCategoriesForActor } from '@/lib/docusign/templates';
import type { LegalDocument, DocumentCategory, UploadMetadata } from '@/types';

// GET - Fetch all documents for the partner (combining legacy and v2)
export async function GET(request: NextRequest) {
  try {
    const { user, partner } = await requireSession();

    const searchParams = request.nextUrl.searchParams;
    const version = searchParams.get('version') || 'v2';

    if (version === 'v1') {
      // Legacy behavior - return old format documents
      const [documents, signatures] = await Promise.all([
        getAllLegalDocuments(),
        getUserSignatures(user.id),
      ]);

      const signedDocIds = new Set(signatures.map((s) => s.documentId));

      const documentsWithStatus = documents.map((doc) => ({
        ...doc,
        signed: signedDocIds.has(doc.id),
        signature: signatures.find((s) => s.documentId === doc.id) || null,
      }));

      return NextResponse.json({ documents: documentsWithStatus });
    }

    // V2 - Return enhanced documents
    console.log('[Legal API] Fetching documents for partner:', partner.id, partner.companyName);
    const documents = await getPartnerLegalDocuments(partner.id);
    console.log('[Legal API] Found', documents.length, 'documents');

    // Get allowed upload categories for partners
    const allowedCategories = getCategoriesForActor('partner');

    return NextResponse.json({
      documents,
      partnerId: partner.id,
      partnerName: partner.companyName,
      allowedCategories: allowedCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        requiresVerification: cat.requiresVerification,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get legal documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Upload a new document
export async function POST(request: NextRequest) {
  try {
    const { user, partner } = await requireSession();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as DocumentCategory | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const expirationDate = formData.get('expirationDate') as string | null;

    // Validate required fields
    if (!file || !category || !title) {
      return NextResponse.json(
        { error: 'File, category, and title are required' },
        { status: 400 }
      );
    }

    // Validate category is allowed for partners
    const allowedCategories = getCategoriesForActor('partner');
    const categoryConfig = allowedCategories.find((c) => c.id === category);

    if (!categoryConfig) {
      return NextResponse.json(
        { error: 'Category not allowed for partners' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file.name, file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload file to blob storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadFileFromBuffer(
      buffer,
      partner.id,
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
      uploadedBy: 'partner',
      uploadedByUserId: user.id,
      uploadedByName: user.name,
      verificationStatus: categoryConfig.requiresVerification ? 'pending' : undefined,
    };

    const document: LegalDocument = {
      id: documentId,
      partnerId: partner.id,
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
      'uploaded',
      { type: 'partner', id: user.id, name: user.name },
      {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        category,
      },
      { ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0], userAgent }
    );

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Upload document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
