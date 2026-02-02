import { NextRequest, NextResponse } from 'next/server';
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
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { user, partner } = await requireSession();
    const { documentId } = await context.params;

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'document'; // 'document' or 'certificate'

    const document = await getLegalDocumentV2(documentId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify partner owns this document
    if (document.partnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
        return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
      }

      const arrayBuffer = await response.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileName = document.uploadMetadata.fileName;
      contentType = document.uploadMetadata.mimeType;
    } else {
      return NextResponse.json({ error: 'Document has no downloadable content' }, { status: 400 });
    }

    // Log download event
    await addDocumentAuditLog(
      documentId,
      'downloaded',
      { type: 'partner', id: user.id, name: user.name },
      { downloadType: type },
      { ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0], userAgent }
    );

    // Return file as download
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Download document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
