'use client';

import { useState, useEffect } from 'react';
import { X, Download, FileText, CheckCircle, Clock, AlertTriangle, User, Calendar, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { LegalDocument, DocumentAuditEvent, DocumentStatus } from '@/types';

import { logger } from '@/lib/logger';
interface AdminDocumentDetailProps {
  document: LegalDocument;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const statusConfig: Record<DocumentStatus, { color: string; label: string }> = {
  draft: { color: 'text-[var(--color-text-secondary)]', label: 'Borrador' },
  pending_signature: { color: 'text-amber-500', label: 'Pendiente Firma' },
  partially_signed: { color: 'text-[var(--color-primary)]', label: 'Parcialmente Firmado' },
  active: { color: 'text-green-500', label: 'Activo' },
  expired: { color: 'text-red-500', label: 'Expirado' },
  superseded: { color: 'text-[var(--color-text-muted)]', label: 'Reemplazado' },
  archived: { color: 'text-[var(--color-text-muted)]', label: 'Archivado' },
};

const categoryLabels: Record<string, string> = {
  contract: 'Contrato',
  amendment: 'Addendum',
  compliance: 'Compliance',
  financial: 'Financiero',
  certification: 'Certificacion',
  policy: 'Politica',
  correspondence: 'Correspondencia',
};

export function AdminDocumentDetail({ document, isOpen, onClose, onRefresh }: AdminDocumentDetailProps) {
  const [auditEvents, setAuditEvents] = useState<DocumentAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && document.id) {
      fetchAuditEvents();
    }
  }, [isOpen, document.id]);

  const fetchAuditEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sovra/documents/${document.id}`);
      if (res.ok) {
        const data = await res.json();
        setAuditEvents(data.auditEvents || []);
      }
    } catch (error) {
      logger.error('Failed to fetch audit events:', { error: error });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleVerify = async (approved: boolean) => {
    try {
      const res = await fetch(`/api/sovra/documents/${document.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approved ? 'verified' : 'rejected',
          notes: approved ? 'Documento verificado por admin' : 'Documento rechazado por admin',
        }),
      });

      if (res.ok) {
        onRefresh();
        onClose();
      }
    } catch (error) {
      logger.error('Failed to verify document:', { error: error });
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

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Documento creado',
      uploaded: 'Documento subido',
      signed: 'Firmado',
      sent_for_signature: 'Enviado para firma',
      viewed: 'Visualizado',
      downloaded: 'Descargado',
      declined: 'Rechazado',
      rejected: 'Rechazado',
      expired: 'Expirado',
      archived: 'Archivado',
      new_version_created: 'Nueva version creada',
      verified: 'Verificado',
    };
    return labels[action] || action;
  };

  const needsVerification =
    document.type === 'upload' && document.uploadMetadata?.verificationStatus === 'pending';

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
          className="bg-[var(--color-surface)] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--color-border)]"
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
            {/* Status and Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant={document.status === 'active' ? 'success' : document.status === 'pending_signature' ? 'warning' : 'secondary'}
              >
                {statusConfig[document.status].label}
              </Badge>
              <Badge variant="outline">
                {categoryLabels[document.category]}
              </Badge>
              {document.type === 'docusign' && (
                <Badge variant="outline">DocuSign</Badge>
              )}
              {needsVerification && (
                <Badge variant="warning">Pendiente Verificacion</Badge>
              )}
            </div>

            {/* Description */}
            {document.description && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Descripcion</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{document.description}</p>
              </div>
            )}

            {/* Document Info */}
            <div className="grid grid-cols-2 gap-4">
              {document.effectiveDate && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                    <Calendar className="h-4 w-4" />
                    Fecha de vigencia
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
                    Fecha de vencimiento
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
                  Creado por
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {document.createdByName || 'Desconocido'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                  <Calendar className="h-4 w-4" />
                  Fecha de creacion
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {formatShortDate(document.createdAt)}
                </p>
              </div>
            </div>

            {/* DocuSign Signers */}
            {document.type === 'docusign' && document.docusignMetadata?.signers && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Firmas</h3>
                <div className="space-y-2">
                  {document.docusignMetadata.signers.map((signer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[var(--color-surface-hover)] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">{signer.name}</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {signer.role === 'sovra' ? 'Sovra' : 'Partner'} - {signer.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {signer.status === 'signed' ? (
                          <>
                            <Badge variant="success" className="text-xs">Firmado</Badge>
                            {signer.signedAt && (
                              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                {formatDate(signer.signedAt)}
                              </p>
                            )}
                          </>
                        ) : signer.status === 'declined' ? (
                          <Badge variant="destructive" className="text-xs">Rechazado</Badge>
                        ) : (
                          <Badge variant="warning" className="text-xs">Pendiente</Badge>
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
                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Informacion del archivo</h3>
                <div className="p-3 bg-[var(--color-surface-hover)] rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Nombre del archivo</span>
                    <span className="text-[var(--color-text-primary)]">{document.uploadMetadata.fileName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Subido por</span>
                    <span className="text-[var(--color-text-primary)]">
                      {document.uploadMetadata.uploadedByName}
                      {document.uploadMetadata.uploadedBy === 'sovra' ? ' (Sovra)' : ' (Partner)'}
                    </span>
                  </div>
                  {document.uploadMetadata.verificationStatus && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">Estado de verificacion</span>
                      <Badge
                        variant={
                          document.uploadMetadata.verificationStatus === 'verified'
                            ? 'success'
                            : document.uploadMetadata.verificationStatus === 'rejected'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {document.uploadMetadata.verificationStatus === 'verified'
                          ? 'Verificado'
                          : document.uploadMetadata.verificationStatus === 'rejected'
                          ? 'Rechazado'
                          : 'Pendiente'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audit Timeline */}
            {auditEvents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Historial</h3>
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
                            {getActionLabel(event.action)}
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
            {needsVerification && (
              <>
                <Button variant="outline" onClick={() => handleVerify(false)}>
                  Rechazar
                </Button>
                <Button onClick={() => handleVerify(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verificar
                </Button>
              </>
            )}
            {document.type === 'docusign' && document.docusignMetadata?.certificateUrl && (
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Descargar Certificado
              </Button>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
