'use client';

import { X, Download, FileText, CheckCircle, Clock, AlertTriangle, User, Calendar, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { LegalDocument, DocumentAuditEvent, DocumentStatus } from '@/types';

interface DocumentDetailProps {
  document: LegalDocument;
  auditEvents: DocumentAuditEvent[];
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onDownloadCertificate?: () => void;
  onSign?: () => void;
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: any) => string;
}

const statusConfig: Record<DocumentStatus, { color: string; label: string }> = {
  draft: { color: 'text-gray-500', label: 'draft' },
  pending_signature: { color: 'text-amber-500', label: 'pending_signature' },
  partially_signed: { color: 'text-blue-500', label: 'partially_signed' },
  active: { color: 'text-green-500', label: 'active' },
  expired: { color: 'text-red-500', label: 'expired' },
  superseded: { color: 'text-gray-400', label: 'superseded' },
  archived: { color: 'text-gray-400', label: 'archived' },
};

export function DocumentDetail({
  document,
  auditEvents,
  isOpen,
  onClose,
  onDownload,
  onDownloadCertificate,
  onSign,
  locale,
  t,
}: DocumentDetailProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'pt' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'pt' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const needsSignature =
    document.status === 'pending_signature' || document.status === 'partially_signed';

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[var(--color-surface)] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] truncate">
                {document.title}
              </h2>
              {document.version > 1 && (
                <span className="text-sm text-[var(--color-text-secondary)]">v{document.version}</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors ml-4"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge
                variant={document.status === 'active' ? 'success' : document.status === 'pending_signature' ? 'warning' : 'secondary'}
                className="text-sm"
              >
                {t(`status.${statusConfig[document.status].label}`)}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {t(`categories.${document.category}`)}
              </Badge>
              {document.type === 'docusign' && (
                <Badge variant="outline" className="text-sm">
                  DocuSign
                </Badge>
              )}
            </div>

            {/* Description */}
            {document.description && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  {t('description')}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{document.description}</p>
              </div>
            )}

            {/* Document Info */}
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
                  <p className={cn(
                    'text-sm font-medium',
                    new Date(document.expirationDate) < new Date()
                      ? 'text-red-500'
                      : 'text-[var(--color-text-primary)]'
                  )}>
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

            {/* DocuSign Signers */}
            {document.type === 'docusign' && document.docusignMetadata?.signers && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                  {t('signatures')}
                </h3>
                <div className="space-y-2">
                  {document.docusignMetadata.signers.map((signer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {signer.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {signer.role === 'sovra' ? 'Sovra' : t('partner')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {signer.status === 'signed' ? (
                          <>
                            <Badge variant="success" className="text-xs">
                              {t('signed')}
                            </Badge>
                            {signer.signedAt && (
                              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                {formatDate(signer.signedAt)}
                              </p>
                            )}
                          </>
                        ) : signer.status === 'declined' ? (
                          <Badge variant="destructive" className="text-xs">
                            {t('declined')}
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-xs">
                            {t('pending')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Info */}
            {document.type === 'upload' && document.uploadMetadata && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                  {t('fileInfo')}
                </h3>
                <div className="p-3 bg-[var(--color-bg)] rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">{t('fileName')}</span>
                    <span className="text-[var(--color-text-primary)]">{document.uploadMetadata.fileName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">{t('uploadedBy')}</span>
                    <span className="text-[var(--color-text-primary)]">{document.uploadMetadata.uploadedByName}</span>
                  </div>
                  {document.uploadMetadata.verificationStatus && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">{t('verification')}</span>
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
              </div>
            )}

            {/* Audit Timeline */}
            {auditEvents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                  {t('history')}
                </h3>
                <div className="space-y-3">
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
                            {event.actorName && (
                              <span className="text-[var(--color-text-secondary)]"> - {event.actorName}</span>
                            )}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {formatDate(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--color-border)]">
            {needsSignature && onSign && (
              <Button onClick={onSign}>{t('sign')}</Button>
            )}
            {onDownload && (
              <Button variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                {t('downloadDocument')}
              </Button>
            )}
            {document.type === 'docusign' &&
              document.docusignMetadata?.certificateUrl &&
              onDownloadCertificate && (
                <Button variant="outline" onClick={onDownloadCertificate}>
                  <Shield className="h-4 w-4 mr-2" />
                  {t('downloadCertificate')}
                </Button>
              )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
