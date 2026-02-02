import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getSession,
  getUser,
  getLegalDocumentV2,
  updateLegalDocumentV2,
  addDocumentAuditLog,
} from '@/lib/redis/operations';

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

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

// POST - Verify or reject a document
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { user } = await requireSovraAdmin();
    const { documentId } = await context.params;

    const body = await request.json();
    const { action, notes } = body as { action: 'verify' | 'reject'; notes?: string };

    if (!action || !['verify', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "verify" or "reject"' },
        { status: 400 }
      );
    }

    const document = await getLegalDocumentV2(documentId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Only uploaded documents can be verified
    if (document.type !== 'upload' || !document.uploadMetadata) {
      return NextResponse.json(
        { error: 'Only uploaded documents can be verified' },
        { status: 400 }
      );
    }

    // Get IP and user agent for audit
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
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

    return NextResponse.json({
      document: updatedDocument,
      message: action === 'verify' ? 'Document verified successfully' : 'Document rejected',
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
    console.error('Verify document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
