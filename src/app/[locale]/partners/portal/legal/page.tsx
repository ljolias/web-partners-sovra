'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { hasPermission } from '@/lib/permissions';
import {
  DocumentList,
  DocumentUploadModal,
  DocumentDetail,
  type UploadData,
} from '@/components/legal';
import { SovraLoader } from '@/components/ui';
import type { LegalDocument, DocumentAuditEvent, User, UserRole, DocumentCategory } from '@/types';

import { logger } from '@/lib/logger';
interface LegalPageProps {
  params: Promise<{ locale: string }>;
}

interface AllowedCategory {
  id: DocumentCategory;
  name: Record<string, string>;
  description: Record<string, string>;
  requiresVerification: boolean;
}

interface PartnerInfo {
  partnerId: string;
  partnerName: string;
}

export default function LegalPage({ params }: LegalPageProps) {
  const { locale } = use(params);
  const t = useTranslations('legal');
  const router = useRouter();

  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [allowedCategories, setAllowedCategories] = useState<AllowedCategory[]>([]);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [auditEvents, setAuditEvents] = useState<DocumentAuditEvent[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/partners/legal');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setAllowedCategories(data.allowedCategories || []);
        if (data.partnerId && data.partnerName) {
          setPartnerInfo({ partnerId: data.partnerId, partnerName: data.partnerName });
        }
        logger.debug('Loaded documents for partner', { count: data.documents?.length || 0, partnerName: data.partnerName, partnerId: data.partnerId });
      }
    } catch (error) {
      logger.error('Failed to fetch documents:', { error: error });
    }
  }, []);

  useEffect(() => {
    async function checkAccessAndFetch() {
      try {
        // Check user permissions
        const userRes = await fetch('/api/partners/auth/me');
        if (!userRes.ok) {
          router.replace(`/${locale}/partners/login`);
          return;
        }
        const userData = await userRes.json();
        const user = userData.user as User;

        if (!hasPermission(user.role as UserRole, 'legal:view')) {
          router.replace(`/${locale}/partners/portal`);
          return;
        }

        setIsAuthorized(true);
        await fetchDocuments();
      } catch (error) {
        logger.error('Failed to check access:', { error: error });
      } finally {
        setIsLoading(false);
      }
    }

    checkAccessAndFetch();
  }, [locale, router, fetchDocuments]);

  // Handle view document
  const handleView = async (doc: LegalDocument) => {
    setSelectedDocument(doc);
    setIsDetailLoading(true);

    try {
      const res = await fetch(`/api/partners/legal/${doc.id}`);
      if (res.ok) {
        const data = await res.json();
        setAuditEvents(data.auditEvents || []);
      }
    } catch (error) {
      logger.error('Failed to fetch document details:', { error: error });
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (doc: LegalDocument) => {
    try {
      const res = await fetch(`/api/partners/legal/${doc.id}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.uploadMetadata?.fileName || `${doc.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      logger.error('Failed to download document:', { error: error });
    }
  };

  // Handle download certificate
  const handleDownloadCertificate = async () => {
    if (!selectedDocument || selectedDocument.type !== 'docusign') return;

    try {
      const res = await fetch(`/api/partners/legal/${selectedDocument.id}/download?type=certificate`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedDocument.title}_certificate.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      logger.error('Failed to download certificate:', { error: error });
    }
  };

  // Handle sign (redirects to DocuSign for now)
  const handleSign = async (doc: LegalDocument) => {
    if (doc.type === 'docusign' && doc.docusignMetadata?.envelopeId) {
      // For DocuSign documents, the user should have received an email
      // We could implement embedded signing here
      alert(t('errors.checkEmailForSigning') || 'Please check your email for the signing link.');
    }
  };

  // Handle upload
  const handleUpload = async (data: UploadData) => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('category', data.category);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.expirationDate) formData.append('expirationDate', data.expirationDate);

    const res = await fetch('/api/partners/legal', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Upload failed');
    }

    // Refresh documents list
    await fetchDocuments();
  };

  // Localized categories for upload modal
  const localizedCategories = allowedCategories.map((cat) => ({
    id: cat.id,
    name: cat.name[locale] || cat.name.en,
    description: cat.description[locale] || cat.description.en,
  }));

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
        {partnerInfo && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Partner: {partnerInfo.partnerName} (ID: <code className="bg-[var(--color-surface-hover)] px-1 py-0.5 rounded">{partnerInfo.partnerId}</code>)
          </p>
        )}
      </div>

      <DocumentList
        documents={documents}
        locale={locale}
        onView={handleView}
        onDownload={handleDownload}
        onSign={handleSign}
        onUpload={() => setIsUploadModalOpen(true)}
        canUpload={allowedCategories.length > 0}
        t={t}
      />

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        allowedCategories={localizedCategories}
        t={t}
      />

      {/* Document Detail Modal */}
      {selectedDocument && (
        <DocumentDetail
          document={selectedDocument}
          auditEvents={auditEvents}
          isOpen={!!selectedDocument}
          onClose={() => {
            setSelectedDocument(null);
            setAuditEvents([]);
          }}
          onDownload={() => handleDownload(selectedDocument)}
          onDownloadCertificate={
            selectedDocument.type === 'docusign' &&
            selectedDocument.docusignMetadata?.certificateUrl
              ? handleDownloadCertificate
              : undefined
          }
          onSign={
            selectedDocument.status === 'pending_signature' ||
            selectedDocument.status === 'partially_signed'
              ? () => handleSign(selectedDocument)
              : undefined
          }
          locale={locale}
          t={t}
        />
      )}
    </motion.div>
  );
}
