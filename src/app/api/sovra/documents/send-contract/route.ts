import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getSession,
  getUser,
  getPartner,
  createLegalDocumentV2,
  addDocumentAuditLog,
  generateId,
} from '@/lib/redis/operations';
import {
  createEnvelope,
  isDocuSignConfigured,
  type EnvelopeRecipient,
} from '@/lib/docusign';
import { getTemplate, DOCUMENT_TEMPLATES } from '@/lib/docusign/templates';
import type { LegalDocument, DocuSignMetadata, DocumentCategory } from '@/types';

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

// GET - List available contract templates
export async function GET() {
  try {
    await requireSovraAdmin();

    const templates = DOCUMENT_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      requiredSigners: t.requiredSigners,
      defaultExpirationDays: t.defaultExpirationDays,
    }));

    return NextResponse.json({
      templates,
      docusignConfigured: isDocuSignConfigured(),
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
    console.error('Get templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a contract for signature
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireSovraAdmin();

    if (!isDocuSignConfigured()) {
      return NextResponse.json(
        { error: 'DocuSign is not configured' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      partnerId,
      templateId,
      title,
      description,
      partnerSignerEmail,
      partnerSignerName,
      sovraSignerEmail,
      sovraSignerName,
      effectiveDate,
      expirationDays,
    } = body as {
      partnerId: string;
      templateId: string;
      title: string;
      description?: string;
      partnerSignerEmail: string;
      partnerSignerName: string;
      sovraSignerEmail: string;
      sovraSignerName: string;
      effectiveDate?: string;
      expirationDays?: number;
    };

    // Validate required fields
    if (!partnerId || !templateId || !title || !partnerSignerEmail || !partnerSignerName || !sovraSignerEmail || !sovraSignerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify partner exists
    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get template
    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Prepare signers
    const signers: EnvelopeRecipient[] = [
      {
        email: partnerSignerEmail,
        name: partnerSignerName,
        recipientId: '1',
        routingOrder: '1',
        role: 'partner',
      },
      {
        email: sovraSignerEmail,
        name: sovraSignerName,
        recipientId: '2',
        routingOrder: '2',
        role: 'sovra',
      },
    ];

    // Create DocuSign envelope
    const envelopeId = await createEnvelope({
      templateId: template.templateId,
      emailSubject: `Please sign: ${title}`,
      emailBlurb: description || `${partner.companyName} - ${title}`,
      signers,
      status: 'sent',
    });

    // Calculate expiration date
    const days = expirationDays || template.defaultExpirationDays || 365;
    const effective = effectiveDate ? new Date(effectiveDate) : new Date();
    const expiration = new Date(effective.getTime() + days * 24 * 60 * 60 * 1000);

    // Get IP and user agent for audit
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create document record
    const documentId = generateId();
    const now = new Date().toISOString();

    const docusignMetadata: DocuSignMetadata = {
      envelopeId,
      templateId: template.templateId,
      envelopeStatus: 'sent',
      signers: [
        {
          email: partnerSignerEmail,
          name: partnerSignerName,
          role: 'partner',
          status: 'sent',
        },
        {
          email: sovraSignerEmail,
          name: sovraSignerName,
          role: 'sovra',
          status: 'pending',
        },
      ],
      sentAt: now,
    };

    const document: LegalDocument = {
      id: documentId,
      partnerId,
      title,
      description,
      category: template.category as DocumentCategory,
      type: 'docusign',
      docusignMetadata,
      status: 'pending_signature',
      version: 1,
      effectiveDate: effective.toISOString(),
      expirationDate: expiration.toISOString(),
      createdBy: user.id,
      createdByName: user.name,
      createdAt: now,
      updatedAt: now,
    };

    await createLegalDocumentV2(document);

    // Log audit event
    await addDocumentAuditLog(
      documentId,
      'sent_for_signature',
      { type: 'sovra', id: user.id, name: user.name },
      {
        templateId,
        envelopeId,
        partnerSigner: { email: partnerSignerEmail, name: partnerSignerName },
        sovraSigner: { email: sovraSignerEmail, name: sovraSignerName },
      },
      { ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0], userAgent }
    );

    return NextResponse.json({ document, envelopeId }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Send contract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
