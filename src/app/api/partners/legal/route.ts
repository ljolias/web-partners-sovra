import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getAllLegalDocuments, getUserSignatures } from '@/lib/redis';

export async function GET() {
  try {
    const { user } = await requireSession();

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
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get legal documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
