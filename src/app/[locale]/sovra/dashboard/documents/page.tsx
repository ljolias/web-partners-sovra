'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Send, Upload, Eye, Download, CheckCircle, Clock, AlertTriangle, FileText, Users } from 'lucide-react';
import { Button, Badge, Card, CardContent, SovraLoader } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Partner, LegalDocument, DocumentCategory, DocumentStatus } from '@/types';

// Import modals
import { ShareDocumentModal } from '@/components/sovra/documents/ShareDocumentModal';
import { SendContractModal } from '@/components/sovra/documents/SendContractModal';
import { AdminDocumentDetail } from '@/components/sovra/documents/AdminDocumentDetail';

const statusConfig: Record<DocumentStatus, { color: string; bgColor: string; label: string }> = {
  draft: { color: 'text-[var(--color-text-secondary)]', bgColor: 'bg-[var(--color-surface-hover)]', label: 'Borrador' },
  pending_signature: { color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Pendiente Firma' },
  partially_signed: { color: 'text-[var(--color-primary)]', bgColor: 'bg-[var(--color-primary)]/10', label: 'Parcialmente Firmado' },
  active: { color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Activo' },
  expired: { color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'Expirado' },
  superseded: { color: 'text-[var(--color-text-muted)]', bgColor: 'bg-[var(--color-surface-hover)]', label: 'Reemplazado' },
  archived: { color: 'text-[var(--color-text-muted)]', bgColor: 'bg-[var(--color-surface-hover)]', label: 'Archivado' },
};

const categoryLabels: Record<DocumentCategory, string> = {
  contract: 'Contrato',
  amendment: 'Addendum',
  compliance: 'Compliance',
  financial: 'Financiero',
  certification: 'Certificacion',
  policy: 'Politica',
  correspondence: 'Correspondencia',
};

export default function SovraDocumentsPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSendContractModalOpen, setIsSendContractModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);

  // Fetch partners
  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch('/api/sovra/partners');
        if (res.ok) {
          const data = await res.json();
          setPartners(data.partners || []);
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPartners();
  }, []);

  // Fetch documents for selected partner
  const fetchDocuments = useCallback(async () => {
    if (!selectedPartner) {
      setDocuments([]);
      return;
    }

    try {
      const res = await fetch(`/api/sovra/documents?partnerId=${selectedPartner.id}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  }, [selectedPartner]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!doc.title.toLowerCase().includes(query) && !doc.description?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && doc.status !== selectedStatus) return false;
    return true;
  });

  // Group documents
  const pendingDocs = filteredDocuments.filter(d =>
    d.status === 'pending_signature' ||
    d.status === 'partially_signed' ||
    (d.type === 'upload' && d.uploadMetadata?.verificationStatus === 'pending')
  );
  const activeDocs = filteredDocuments.filter(d =>
    d.status === 'active' &&
    !(d.type === 'upload' && d.uploadMetadata?.verificationStatus === 'pending')
  );
  const otherDocs = filteredDocuments.filter(d =>
    !pendingDocs.includes(d) && !activeDocs.includes(d)
  );

  const handleShareSuccess = () => {
    setIsShareModalOpen(false);
    fetchDocuments();
  };

  const handleSendContractSuccess = () => {
    setIsSendContractModalOpen(false);
    fetchDocuments();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Documentos <span className="text-[var(--color-primary)]">Legales</span>
        </h1>
        <p className="text-[var(--color-text-secondary)]">Gestiona documentos y contratos de partners</p>
      </div>

      {/* Partner Selector */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            <Users className="inline h-4 w-4 mr-2" />
            Seleccionar Partner
          </label>
          <select
            value={selectedPartner?.id || ''}
            onChange={(e) => {
              const partner = partners.find(p => p.id === e.target.value);
              setSelectedPartner(partner || null);
            }}
            className="w-full md:w-96 px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">-- Selecciona un partner --</option>
            {partners.map(partner => (
              <option key={partner.id} value={partner.id}>
                {partner.companyName} ({partner.name})
              </option>
            ))}
          </select>
          {selectedPartner && (
            <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Partner ID: <code className="bg-[var(--color-surface-hover)] px-1 py-0.5 rounded">{selectedPartner.id}</code>
              {' • '}Tier: <span className="capitalize">{selectedPartner.tier}</span>
              {' • '}Email: {selectedPartner.email}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPartner && (
        <>
          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setIsSendContractModalOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Contrato DocuSign
            </Button>
            <Button variant="outline" onClick={() => setIsShareModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Compartir Documento
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | 'all')}
              className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="all">Todas las categorias</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DocumentStatus | 'all')}
              className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Documents List */}
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-[var(--color-text-muted)]" />
                <p className="mt-4 text-[var(--color-text-secondary)]">
                  {documents.length === 0
                    ? 'No hay documentos para este partner'
                    : 'No se encontraron documentos con los filtros aplicados'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Pending Action */}
              {pendingDocs.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Requieren Accion ({pendingDocs.length})
                  </h2>
                  <div className="space-y-2">
                    {pendingDocs.map(doc => (
                      <DocumentRow
                        key={doc.id}
                        document={doc}
                        onView={() => setSelectedDocument(doc)}
                        onRefresh={fetchDocuments}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Active Documents */}
              {activeDocs.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Documentos Activos ({activeDocs.length})
                  </h2>
                  <div className="space-y-2">
                    {activeDocs.map(doc => (
                      <DocumentRow
                        key={doc.id}
                        document={doc}
                        onView={() => setSelectedDocument(doc)}
                        onRefresh={fetchDocuments}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Documents */}
              {otherDocs.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]" />
                    Otros ({otherDocs.length})
                  </h2>
                  <div className="space-y-2">
                    {otherDocs.map(doc => (
                      <DocumentRow
                        key={doc.id}
                        document={doc}
                        onView={() => setSelectedDocument(doc)}
                        onRefresh={fetchDocuments}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedPartner && (
        <>
          <ShareDocumentModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            partner={selectedPartner}
            onSuccess={handleShareSuccess}
          />
          <SendContractModal
            isOpen={isSendContractModalOpen}
            onClose={() => setIsSendContractModalOpen(false)}
            partner={selectedPartner}
            onSuccess={handleSendContractSuccess}
          />
        </>
      )}

      {selectedDocument && (
        <AdminDocumentDetail
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onRefresh={fetchDocuments}
        />
      )}
    </div>
  );
}

// Document Row Component
interface DocumentRowProps {
  document: LegalDocument;
  onView: () => void;
  onRefresh: () => void;
  formatDate: (date: string) => string;
}

function DocumentRow({ document, onView, onRefresh, formatDate }: DocumentRowProps) {
  const status = statusConfig[document.status];
  const needsVerification = document.type === 'upload' && document.uploadMetadata?.verificationStatus === 'pending';

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
      }
    } catch (error) {
      console.error('Failed to verify document:', error);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', status.bgColor)}>
            {document.status === 'active' ? (
              <CheckCircle className={cn('h-5 w-5', status.color)} />
            ) : document.status === 'pending_signature' || document.status === 'partially_signed' ? (
              <Clock className={cn('h-5 w-5', status.color)} />
            ) : document.status === 'expired' ? (
              <AlertTriangle className={cn('h-5 w-5', status.color)} />
            ) : (
              <FileText className={cn('h-5 w-5', status.color)} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[var(--color-text-primary)] truncate">{document.title}</h3>
              {document.version > 1 && (
                <span className="text-xs text-[var(--color-text-secondary)]">v{document.version}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[document.category]}
              </Badge>
              <Badge
                variant={document.type === 'docusign' ? 'outline' : 'secondary'}
                className="text-xs"
              >
                {document.type === 'docusign' ? 'DocuSign' : 'Subido'}
              </Badge>
              {needsVerification && (
                <Badge variant="warning" className="text-xs">
                  Pendiente Verificacion
                </Badge>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {document.createdAt && `Creado: ${formatDate(document.createdAt)}`}
              {document.expirationDate && ` | Expira: ${formatDate(document.expirationDate)}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {needsVerification && (
              <>
                <Button size="sm" onClick={() => handleVerify(true)}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verificar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleVerify(false)}>
                  Rechazar
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
