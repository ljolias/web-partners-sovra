import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getLegalDocument, signLegalDocument, generateId } from '@/lib/redis';
import type { LegalSignature } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { user, partner } = await requireSession();

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const document = await getLegalDocument(documentId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
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

    return NextResponse.json({ signature });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Sign document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
