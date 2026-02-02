import { NextRequest, NextResponse } from 'next/server';
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

interface RouteParams {
  params: Promise<{ documentId: string }>;
}

// GET - Get document details with audit events
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireSovraAdmin();
    const { documentId } = await params;

    const document = await getLegalDocumentV2(documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get audit events
    const auditEvents = await getDocumentAuditEvents(documentId);

    // Get partner info
    const partner = await getPartner(document.partnerId);

    return NextResponse.json({
      document: {
        ...document,
        partner: partner ? { id: partner.id, name: partner.companyName } : null,
      },
      auditEvents,
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
    console.error('Get document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
