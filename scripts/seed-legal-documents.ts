import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Keys - must match src/lib/redis/keys.ts
const keys = {
  documentV2: (id: string) => `legal:v2:document:${id}`,
  partnerLegalDocuments: (partnerId: string) => `partner:${partnerId}:legal:documents`,
  documentsByCategory: (category: string) => `legal:documents:category:${category}`,
  documentsByStatus: (status: string) => `legal:documents:status:${status}`,
  auditEvent: (id: string) => `legal:audit:${id}`,
  documentAuditEvents: (documentId: string) => `legal:document:${documentId}:audit`,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

async function seedDocuments() {
  // Use actual partner ID from the database
  const partnerId = '1769998036290-143txhs';

  console.log('Seeding legal documents for partner:', partnerId);

  const now = new Date();
  const documents = [
    // DocuSign - Signed Contract
    {
      id: generateId(),
      partnerId,
      title: 'Acuerdo de Partner Sovra 2025',
      description: 'Contrato principal de partnership con términos y condiciones generales.',
      category: 'contract',
      type: 'docusign',
      status: 'active',
      version: 1,
      effectiveDate: '2025-01-01',
      expirationDate: '2025-12-31',
      docusignMetadata: {
        envelopeId: 'env-demo-001',
        templateId: 'tmpl-partner-agreement',
        envelopeStatus: 'completed',
        signers: [
          {
            email: 'partner@techsolutions.com',
            name: 'Juan Pérez',
            role: 'partner',
            status: 'signed',
            signedAt: '2025-01-02T10:30:00Z',
          },
          {
            email: 'legal@sovra.io',
            name: 'María García',
            role: 'sovra',
            status: 'signed',
            signedAt: '2025-01-02T14:15:00Z',
          },
        ],
        signedDocumentUrl: 'https://demo.docusign.net/documents/signed-001.pdf',
        certificateUrl: 'https://demo.docusign.net/certificates/cert-001.pdf',
        sentAt: '2025-01-01T09:00:00Z',
        completedAt: '2025-01-02T14:15:00Z',
      },
      createdBy: 'sovra-admin',
      createdByName: 'Admin Sovra',
      createdAt: '2025-01-01T09:00:00Z',
      updatedAt: '2025-01-02T14:15:00Z',
    },
    // DocuSign - Pending Signature
    {
      id: generateId(),
      partnerId,
      title: 'NDA - Acuerdo de Confidencialidad 2026',
      description: 'Acuerdo de no divulgación para proyectos especiales.',
      category: 'contract',
      type: 'docusign',
      status: 'pending_signature',
      version: 1,
      effectiveDate: '2026-02-01',
      expirationDate: '2027-01-31',
      docusignMetadata: {
        envelopeId: 'env-demo-002',
        templateId: 'tmpl-nda',
        envelopeStatus: 'sent',
        signers: [
          {
            email: 'partner@techsolutions.com',
            name: 'Juan Pérez',
            role: 'partner',
            status: 'pending',
          },
          {
            email: 'legal@sovra.io',
            name: 'María García',
            role: 'sovra',
            status: 'pending',
          },
        ],
        sentAt: '2026-01-28T11:00:00Z',
      },
      createdBy: 'sovra-admin',
      createdByName: 'Admin Sovra',
      createdAt: '2026-01-28T11:00:00Z',
      updatedAt: '2026-01-28T11:00:00Z',
    },
    // DocuSign - Partially Signed
    {
      id: generateId(),
      partnerId,
      title: 'Addendum - Términos de Comisiones Q1 2026',
      description: 'Modificación de estructura de comisiones para el primer trimestre.',
      category: 'amendment',
      type: 'docusign',
      status: 'partially_signed',
      version: 1,
      effectiveDate: '2026-01-01',
      expirationDate: '2026-03-31',
      docusignMetadata: {
        envelopeId: 'env-demo-003',
        templateId: 'tmpl-amendment',
        envelopeStatus: 'delivered',
        signers: [
          {
            email: 'partner@techsolutions.com',
            name: 'Juan Pérez',
            role: 'partner',
            status: 'signed',
            signedAt: '2026-01-20T16:45:00Z',
          },
          {
            email: 'legal@sovra.io',
            name: 'María García',
            role: 'sovra',
            status: 'pending',
          },
        ],
        sentAt: '2026-01-18T10:00:00Z',
      },
      createdBy: 'sovra-admin',
      createdByName: 'Admin Sovra',
      createdAt: '2026-01-18T10:00:00Z',
      updatedAt: '2026-01-20T16:45:00Z',
    },
    // Upload - Compliance Document (Verified)
    {
      id: generateId(),
      partnerId,
      title: 'Certificado de Registro Fiscal',
      description: 'Constancia de situación fiscal vigente.',
      category: 'compliance',
      type: 'upload',
      status: 'active',
      version: 1,
      effectiveDate: '2025-06-01',
      expirationDate: '2026-05-31',
      uploadMetadata: {
        fileUrl: 'https://example.com/docs/fiscal-cert.pdf',
        fileName: 'certificado_fiscal_2025.pdf',
        fileSize: 245678,
        mimeType: 'application/pdf',
        uploadedBy: 'partner',
        uploadedByUserId: 'user-partner-001',
        uploadedByName: 'Juan Pérez',
        verificationStatus: 'verified',
        verifiedBy: 'sovra-admin',
        verifiedAt: '2025-06-02T09:30:00Z',
        verificationNotes: 'Documento verificado correctamente.',
      },
      createdBy: 'user-partner-001',
      createdByName: 'Juan Pérez',
      createdAt: '2025-06-01T14:20:00Z',
      updatedAt: '2025-06-02T09:30:00Z',
    },
    // Upload - Certification
    {
      id: generateId(),
      partnerId,
      title: 'Certificación ISO 27001',
      description: 'Certificación de seguridad de la información.',
      category: 'certification',
      type: 'upload',
      status: 'active',
      version: 1,
      effectiveDate: '2024-03-15',
      expirationDate: '2027-03-14',
      uploadMetadata: {
        fileUrl: 'https://example.com/docs/iso-cert.pdf',
        fileName: 'ISO_27001_Certificate.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        uploadedBy: 'partner',
        uploadedByUserId: 'user-partner-001',
        uploadedByName: 'Juan Pérez',
        verificationStatus: 'verified',
        verifiedBy: 'sovra-admin',
        verifiedAt: '2024-03-16T11:00:00Z',
      },
      createdBy: 'user-partner-001',
      createdByName: 'Juan Pérez',
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-16T11:00:00Z',
    },
    // Upload - Financial (Shared by Sovra)
    {
      id: generateId(),
      partnerId,
      title: 'Reporte de Comisiones Q4 2025',
      description: 'Detalle de comisiones generadas en el cuarto trimestre de 2025.',
      category: 'financial',
      type: 'upload',
      status: 'active',
      version: 1,
      uploadMetadata: {
        fileUrl: 'https://example.com/docs/commissions-q4.pdf',
        fileName: 'Comisiones_Q4_2025.pdf',
        fileSize: 189000,
        mimeType: 'application/pdf',
        uploadedBy: 'sovra',
        uploadedByUserId: 'sovra-admin',
        uploadedByName: 'Admin Sovra',
      },
      createdBy: 'sovra-admin',
      createdByName: 'Admin Sovra',
      createdAt: '2026-01-05T10:00:00Z',
      updatedAt: '2026-01-05T10:00:00Z',
    },
    // Upload - Policy (Shared by Sovra)
    {
      id: generateId(),
      partnerId,
      title: 'Manual de Marca Sovra 2026',
      description: 'Guía de uso de marca, logos y materiales de marketing.',
      category: 'policy',
      type: 'upload',
      status: 'active',
      version: 2,
      uploadMetadata: {
        fileUrl: 'https://example.com/docs/brand-manual.pdf',
        fileName: 'Manual_Marca_Sovra_2026.pdf',
        fileSize: 4500000,
        mimeType: 'application/pdf',
        uploadedBy: 'sovra',
        uploadedByUserId: 'sovra-admin',
        uploadedByName: 'Admin Sovra',
      },
      createdBy: 'sovra-admin',
      createdByName: 'Admin Sovra',
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-01-10T08:00:00Z',
    },
    // Upload - Pending Verification
    {
      id: generateId(),
      partnerId,
      title: 'Póliza de Seguro de Responsabilidad Civil',
      description: 'Póliza de seguro vigente para operaciones comerciales.',
      category: 'compliance',
      type: 'upload',
      status: 'active',
      version: 1,
      effectiveDate: '2026-01-01',
      expirationDate: '2026-12-31',
      uploadMetadata: {
        fileUrl: 'https://example.com/docs/insurance.pdf',
        fileName: 'poliza_seguro_2026.pdf',
        fileSize: 320000,
        mimeType: 'application/pdf',
        uploadedBy: 'partner',
        uploadedByUserId: 'user-partner-001',
        uploadedByName: 'Juan Pérez',
        verificationStatus: 'pending',
      },
      createdBy: 'user-partner-001',
      createdByName: 'Juan Pérez',
      createdAt: '2026-01-30T15:00:00Z',
      updatedAt: '2026-01-30T15:00:00Z',
    },
    // Expired Contract
    {
      id: generateId(),
      partnerId,
      title: 'Acuerdo de Partner Sovra 2024',
      description: 'Contrato de partnership período anterior.',
      category: 'contract',
      type: 'docusign',
      status: 'expired',
      version: 1,
      effectiveDate: '2024-01-01',
      expirationDate: '2024-12-31',
      docusignMetadata: {
        envelopeId: 'env-demo-old-001',
        envelopeStatus: 'completed',
        signers: [
          {
            email: 'partner@techsolutions.com',
            name: 'Juan Pérez',
            role: 'partner',
            status: 'signed',
            signedAt: '2024-01-03T10:00:00Z',
          },
          {
            email: 'legal@sovra.io',
            name: 'María García',
            role: 'sovra',
            status: 'signed',
            signedAt: '2024-01-03T15:00:00Z',
          },
        ],
        signedDocumentUrl: 'https://demo.docusign.net/documents/signed-old.pdf',
        completedAt: '2024-01-03T15:00:00Z',
      },
      createdBy: 'sovra-admin',
      createdByName: 'Admin Sovra',
      createdAt: '2024-01-01T09:00:00Z',
      updatedAt: '2024-01-03T15:00:00Z',
    },
  ];

  // Audit events for first document
  const auditEvents = [
    {
      id: generateId(),
      documentId: '', // Will be set after creating documents
      action: 'created',
      actorType: 'sovra',
      actorId: 'sovra-admin',
      actorName: 'Admin Sovra',
      timestamp: '2025-01-01T09:00:00Z',
    },
    {
      id: generateId(),
      documentId: '',
      action: 'sent_for_signature',
      actorType: 'system',
      timestamp: '2025-01-01T09:01:00Z',
    },
    {
      id: generateId(),
      documentId: '',
      action: 'signed',
      actorType: 'partner',
      actorId: 'user-partner-001',
      actorName: 'Juan Pérez',
      timestamp: '2025-01-02T10:30:00Z',
    },
    {
      id: generateId(),
      documentId: '',
      action: 'signed',
      actorType: 'sovra',
      actorId: 'sovra-admin',
      actorName: 'María García',
      timestamp: '2025-01-02T14:15:00Z',
    },
  ];

  const pipeline = redis.pipeline();

  for (const doc of documents) {
    const docKey = keys.documentV2(doc.id);

    // Store document
    pipeline.hset(docKey, {
      id: doc.id,
      partnerId: doc.partnerId,
      title: doc.title,
      description: doc.description || '',
      category: doc.category,
      type: doc.type,
      status: doc.status,
      version: doc.version,
      effectiveDate: doc.effectiveDate || '',
      expirationDate: doc.expirationDate || '',
      docusignMetadata: doc.docusignMetadata ? JSON.stringify(doc.docusignMetadata) : '',
      uploadMetadata: doc.uploadMetadata ? JSON.stringify(doc.uploadMetadata) : '',
      createdBy: doc.createdBy,
      createdByName: doc.createdByName || '',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });

    // Add to partner's document list
    pipeline.zadd(keys.partnerLegalDocuments(partnerId), {
      score: new Date(doc.createdAt).getTime(),
      member: doc.id,
    });

    // Add to category index
    pipeline.sadd(keys.documentsByCategory(doc.category), doc.id);

    // Add to status index
    pipeline.sadd(keys.documentsByStatus(doc.status), doc.id);

    console.log(`  - Added: ${doc.title} (${doc.type} - ${doc.status})`);
  }

  // Add audit events for first document
  const firstDocId = documents[0].id;
  for (const event of auditEvents) {
    event.documentId = firstDocId;
    const eventKey = keys.auditEvent(event.id);

    pipeline.hset(eventKey, {
      id: event.id,
      documentId: event.documentId,
      action: event.action,
      actorType: event.actorType,
      actorId: event.actorId || '',
      actorName: event.actorName || '',
      timestamp: event.timestamp,
    });

    pipeline.zadd(keys.documentAuditEvents(firstDocId), {
      score: new Date(event.timestamp).getTime(),
      member: event.id,
    });
  }

  await pipeline.exec();

  console.log('\nSeed completed successfully!');
  console.log(`Added ${documents.length} documents and ${auditEvents.length} audit events.`);
}

seedDocuments().catch(console.error);
