'use client';

import { FileText, CheckCircle, Clock, AlertTriangle, Upload, Pen, Download, Eye } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { LegalDocument, DocumentCategory, DocumentStatus } from '@/types';

interface DocumentCardProps {
  document: LegalDocument;
  locale: string;
  onView?: () => void;
  onDownload?: () => void;
  onSign?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: any) => string;
}

const categoryIcons: Record<DocumentCategory, React.ComponentType<{ className?: string }>> = {
  contract: FileText,
  amendment: FileText,
  compliance: CheckCircle,
  financial: FileText,
  certification: CheckCircle,
  policy: FileText,
  correspondence: FileText,
};

const statusConfig: Record<
  DocumentStatus,
  { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }
> = {
  draft: { color: 'text-[var(--color-text-secondary)]', bgColor: 'bg-[var(--color-surface-hover)]', icon: FileText },
  pending_signature: { color: 'text-amber-500', bgColor: 'bg-amber-500/10', icon: Clock },
  partially_signed: { color: 'text-[var(--color-primary)]', bgColor: 'bg-[var(--color-primary)]/10', icon: Pen },
  active: { color: 'text-green-500', bgColor: 'bg-green-500/10', icon: CheckCircle },
  expired: { color: 'text-red-500', bgColor: 'bg-red-500/10', icon: AlertTriangle },
  superseded: { color: 'text-[var(--color-text-muted)]', bgColor: 'bg-[var(--color-surface-hover)]', icon: FileText },
  archived: { color: 'text-[var(--color-text-muted)]', bgColor: 'bg-[var(--color-surface-hover)]', icon: FileText },
};

export function DocumentCard({ document, locale, onView, onDownload, onSign, t }: DocumentCardProps) {
  const CategoryIcon = categoryIcons[document.category] || FileText;
  const statusInfo = statusConfig[document.status];
  const StatusIcon = statusInfo.icon;

  const isDocuSign = document.type === 'docusign';
  const isUpload = document.type === 'upload';

  const needsSignature =
    document.status === 'pending_signature' || document.status === 'partially_signed';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'pt' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', statusInfo.bgColor)}>
            <StatusIcon className={cn('h-6 w-6', statusInfo.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                {document.title}
              </h3>
              {document.version > 1 && (
                <span className="text-xs text-[var(--color-text-secondary)]">v{document.version}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {t(`categories.${document.category}`)}
              </Badge>

              {isDocuSign && (
                <Badge variant="outline" className="text-xs">
                  DocuSign
                </Badge>
              )}

              {isUpload && document.uploadMetadata?.verificationStatus === 'pending' && (
                <Badge variant="warning" className="text-xs">
                  {t('status.pendingVerification')}
                </Badge>
              )}

              {isUpload && document.uploadMetadata?.verificationStatus === 'verified' && (
                <Badge variant="success" className="text-xs">
                  {t('status.verified')}
                </Badge>
              )}
            </div>

            <div className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {document.status === 'active' && document.expirationDate && (
                <span>{t('validUntil', { date: formatDate(document.expirationDate) })}</span>
              )}
              {needsSignature && isDocuSign && document.docusignMetadata?.sentAt && (
                <span>{t('sentOn', { date: formatDate(document.docusignMetadata.sentAt) })}</span>
              )}
              {isUpload && document.uploadMetadata && (
                <span>
                  {document.uploadMetadata.uploadedBy === 'sovra'
                    ? t('sharedBySovra')
                    : t('uploadedOn', { date: formatDate(document.createdAt) })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {needsSignature && onSign && (
              <Button size="sm" onClick={onSign}>
                {t('sign')}
              </Button>
            )}
            {onView && (
              <Button size="sm" variant="outline" onClick={onView}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onDownload && (document.status === 'active' || isUpload) && (
              <Button size="sm" variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
