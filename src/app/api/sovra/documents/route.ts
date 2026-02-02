import { NextRequest, NextResponse } from 'next/server';
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
    throw new Error('Unauthorized');
  }

  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Unauthorized');
  }

  const user = await getUser(session.userId);
  if (!user || user.role !== 'sovra_admin') {
    throw new Error('Forbidden');
  }

  return { user, session };
}

// GET - List documents (optionally filtered by partner)
export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      documents: documentsWithPartner,
      allowedCategories: allowedCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        requiresVerification: cat.requiresVerification,
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Get documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Share/upload a document to a partner
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: 'File, partnerId, category, and title are required' },
        { status: 400 }
      );
    }

    // Verify partner exists
    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Validate category is allowed for Sovra
    const allowedCategories = getCategoriesForActor('sovra');
    const categoryConfig = allowedCategories.find((c) => c.id === category);

    if (!categoryConfig) {
      return NextResponse.json(
        { error: 'Category not allowed' },
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

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Share document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
