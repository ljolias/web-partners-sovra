import { NextRequest, NextResponse } from 'next/server';
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
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { partner } = await requireSession();
    const { documentId } = await context.params;

    const document = await getLegalDocumentV2(documentId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify partner owns this document
    if (document.partnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    return NextResponse.json({ document, auditEvents });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
