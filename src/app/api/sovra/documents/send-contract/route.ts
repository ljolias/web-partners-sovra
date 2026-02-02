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

// POST - Send a contract for signature (supports both template-based and custom PDF)
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireSovraAdmin();

    // Check content type to determine if it's FormData or JSON
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('multipart/form-data');

    let partnerId: string;
    let templateId: string | undefined;
    let title: string;
    let description: string | undefined;
    let partnerSignerEmail: string;
    let partnerSignerName: string;
    let sovraSignerEmail: string;
    let sovraSignerName: string;
    let effectiveDate: string | undefined;
    let expirationDate: string | undefined;
    let category: DocumentCategory = 'contract';
    let pdfFile: File | null = null;

    if (isFormData) {
      // Handle FormData (custom PDF upload)
      const formData = await request.formData();
      pdfFile = formData.get('file') as File | null;
      partnerId = formData.get('partnerId') as string;
      title = formData.get('title') as string;
      description = formData.get('description') as string | undefined;
      partnerSignerEmail = formData.get('partnerSignerEmail') as string;
      partnerSignerName = formData.get('partnerSignerName') as string;
      sovraSignerEmail = formData.get('sovraSignerEmail') as string;
      sovraSignerName = formData.get('sovraSignerName') as string;
      effectiveDate = formData.get('effectiveDate') as string | undefined;
      expirationDate = formData.get('expirationDate') as string | undefined;
      category = (formData.get('category') as DocumentCategory) || 'contract';
    } else {
      // Handle JSON (template-based)
      const body = await request.json();
      partnerId = body.partnerId;
      templateId = body.templateId;
      title = body.title;
      description = body.description;
      partnerSignerEmail = body.partnerSignerEmail;
      partnerSignerName = body.partnerSignerName;
      sovraSignerEmail = body.sovraSignerEmail;
      sovraSignerName = body.sovraSignerName;
      effectiveDate = body.effectiveDate;

      // Calculate expiration from days
      if (body.expirationDays) {
        const days = body.expirationDays;
        const effective = effectiveDate ? new Date(effectiveDate) : new Date();
        expirationDate = new Date(effective.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    // Validate required fields
    if (!partnerId || !title || !partnerSignerEmail || !partnerSignerName || !sovraSignerEmail || !sovraSignerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For FormData, we need a PDF file
    if (isFormData && !pdfFile) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      );
    }

    // For JSON, we need a templateId
    if (!isFormData && !templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Verify partner exists
    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get template if using template-based approach
    let template = null;
    if (templateId) {
      template = getTemplate(templateId);
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      category = template.category as DocumentCategory;
    }

    // For now, if DocuSign is not configured, create a mock document
    // This allows testing the UI without actual DocuSign integration
    let envelopeId: string;

    if (!isDocuSignConfigured()) {
      // Create a mock envelope ID for demo purposes
      envelopeId = `mock-envelope-${generateId()}`;
      console.log('DocuSign not configured, using mock envelope:', envelopeId);
    } else {
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
      if (pdfFile) {
        // Custom PDF upload - use createEnvelopeWithDocument
        const buffer = Buffer.from(await pdfFile.arrayBuffer());
        // For now, use template approach even with custom PDF
        // In production, you'd use DocuSign's document upload API
        envelopeId = await createEnvelope({
          templateId: template?.templateId || 'custom',
          emailSubject: `Please sign: ${title}`,
          emailBlurb: description || `${partner.companyName} - ${title}`,
          signers,
          status: 'sent',
        });
      } else {
        envelopeId = await createEnvelope({
          templateId: template!.templateId,
          emailSubject: `Please sign: ${title}`,
          emailBlurb: description || `${partner.companyName} - ${title}`,
          signers,
          status: 'sent',
        });
      }
    }

    // Calculate dates
    const effective = effectiveDate ? new Date(effectiveDate) : new Date();
    let expiration: Date;

    if (expirationDate) {
      expiration = new Date(expirationDate);
    } else {
      const days = template?.defaultExpirationDays || 365;
      expiration = new Date(effective.getTime() + days * 24 * 60 * 60 * 1000);
    }

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
      templateId: template?.templateId,
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
      category,
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
        templateId: template?.templateId || 'custom',
        envelopeId,
        partnerSigner: { email: partnerSignerEmail, name: partnerSignerName },
        sovraSigner: { email: sovraSignerEmail, name: sovraSignerName },
        customPdf: !!pdfFile,
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
