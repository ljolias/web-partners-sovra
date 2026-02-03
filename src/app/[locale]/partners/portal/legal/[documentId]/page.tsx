'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Shield,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, SovraLoader } from '@/components/ui';
import { hasPermission } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { LegalDocument, DocumentAuditEvent, User as UserType, UserRole, DocumentStatus } from '@/types';

interface DocumentDetailPageProps {
  params: Promise<{ locale: string; documentId: string }>;
}

const statusConfig: Record<DocumentStatus, { color: string; bgColor: string }> = {
  draft: { color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  pending_signature: { color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  partially_signed: { color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  active: { color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  expired: { color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  superseded: { color: 'text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  archived: { color: 'text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' },
};

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { locale, documentId } = use(params);
  const t = useTranslations('legal');
  const router = useRouter();

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [auditEvents, setAuditEvents] = useState<DocumentAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

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
        const user = userData.user as UserType;

        if (!hasPermission(user.role as UserRole, 'legal:view')) {
          router.replace(`/${locale}/partners/portal`);
          return;
        }

        setIsAuthorized(true);

        // Fetch document
        const docRes = await fetch(`/api/partners/legal/${documentId}`);
        if (!docRes.ok) {
          if (docRes.status === 404) {
            router.replace(`/${locale}/partners/portal/legal`);
            return;
          }
          throw new Error('Failed to fetch document');
        }

        const data = await docRes.json();
        setDocument(data.document);
        setAuditEvents(data.auditEvents || []);
      } catch (error) {
        console.error('Failed to fetch document:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccessAndFetch();
  }, [locale, documentId, router]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === 'es' ? 'es-ES' : locale === 'pt' ? 'pt-BR' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === 'es' ? 'es-ES' : locale === 'pt' ? 'pt-BR' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const res = await fetch(`/api/partners/legal/${documentId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.uploadMetadata?.fileName || `${document.title}.pdf`;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!document || document.type !== 'docusign') return;

    try {
      const res = await fetch(`/api/partners/legal/${documentId}/download?type=certificate`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${document.title}_certificate.pdf`;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download certificate:', error);
    }
  };

  const getActionIcon = (action: DocumentAuditEvent['action']) => {
    switch (action) {
      case 'created':
      case 'uploaded':
        return FileText;
      case 'signed':
        return CheckCircle;
      case 'sent_for_signature':
        return Clock;
      case 'declined':
      case 'rejected':
        return AlertTriangle;
      case 'verified':
        return Shield;
      default:
        return FileText;
    }
  };

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!isAuthorized || !document) {
    return null;
  }

  const needsSignature =
    document.status === 'pending_signature' || document.status === 'partially_signed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/partners/portal/legal`}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{document.title}</h1>
          {document.version > 1 && (
            <span className="text-sm text-[var(--color-text-secondary)]">v{document.version}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            {t('downloadDocument')}
          </Button>
          {document.type === 'docusign' && document.status === 'active' && (
            <Button variant="outline" onClick={handleDownloadCertificate}>
              <Shield className="h-4 w-4 mr-2" />
              {t('downloadCertificate')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Category */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  variant={
                    document.status === 'active'
                      ? 'success'
                      : document.status === 'pending_signature'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {t(`status.${document.status}`)}
                </Badge>
                <Badge variant="outline">{t(`categories.${document.category}`)}</Badge>
                {document.type === 'docusign' && <Badge variant="outline">DocuSign</Badge>}
              </div>

              {document.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    {t('description')}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{document.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {document.effectiveDate && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                      <Calendar className="h-4 w-4" />
                      {t('effectiveDate')}
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {formatShortDate(document.effectiveDate)}
                    </p>
                  </div>
                )}

                {document.expirationDate && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                      <Calendar className="h-4 w-4" />
                      {t('expirationDate')}
                    </div>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        new Date(document.expirationDate) < new Date()
                          ? 'text-red-500'
                          : 'text-[var(--color-text-primary)]'
                      )}
                    >
                      {formatShortDate(document.expirationDate)}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                    <User className="h-4 w-4" />
                    {t('createdBy')}
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {document.createdByName || t('unknown')}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                    <Calendar className="h-4 w-4" />
                    {t('createdAt')}
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {formatShortDate(document.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DocuSign Signers */}
          {document.type === 'docusign' && document.docusignMetadata?.signers && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  {t('signatures')}
                </h3>
                <div className="space-y-3">
                  {document.docusignMetadata.signers.map((signer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-[var(--color-bg)] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">{signer.name}</p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {signer.role === 'sovra' ? 'Sovra' : t('partner')} - {signer.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {signer.status === 'signed' ? (
                          <>
                            <Badge variant="success">{t('signed')}</Badge>
                            {signer.signedAt && (
                              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                {formatDate(signer.signedAt)}
                              </p>
                            )}
                          </>
                        ) : signer.status === 'declined' ? (
                          <Badge variant="destructive">{t('declined')}</Badge>
                        ) : (
                          <Badge variant="warning">{t('pending')}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Info */}
          {document.type === 'upload' && document.uploadMetadata && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  {t('fileInfo')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                    <span className="text-sm text-[var(--color-text-secondary)]">{t('fileName')}</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {document.uploadMetadata.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                    <span className="text-sm text-[var(--color-text-secondary)]">{t('uploadedBy')}</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {document.uploadMetadata.uploadedByName}
                    </span>
                  </div>
                  {document.uploadMetadata.verificationStatus && (
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-[var(--color-text-secondary)]">{t('verification')}</span>
                      <Badge
                        variant={
                          document.uploadMetadata.verificationStatus === 'verified'
                            ? 'success'
                            : document.uploadMetadata.verificationStatus === 'rejected'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {t(`verificationStatus.${document.uploadMetadata.verificationStatus}`)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Audit History */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                {t('history')}
              </h3>
              {auditEvents.length > 0 ? (
                <div className="space-y-4">
                  {auditEvents.map((event) => {
                    const Icon = getActionIcon(event.action);
                    return (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center">
                            <Icon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text-primary)]">
                            {t(`auditActions.${event.action}`)}
                          </p>
                          {event.actorName && (
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {event.actorName}
                            </p>
                          )}
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {formatDate(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-secondary)]">No history available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
