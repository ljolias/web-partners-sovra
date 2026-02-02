'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { DocumentCard } from './DocumentCard';
import { DocumentFilters } from './DocumentFilters';
import type { LegalDocument, DocumentCategory, DocumentStatus } from '@/types';

interface DocumentListProps {
  documents: LegalDocument[];
  locale: string;
  onView: (doc: LegalDocument) => void;
  onDownload: (doc: LegalDocument) => void;
  onSign?: (doc: LegalDocument) => void;
  onUpload?: () => void;
  canUpload?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: any) => string;
}

export function DocumentList({
  documents,
  locale,
  onView,
  onDownload,
  onSign,
  onUpload,
  canUpload = false,
  t,
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesDescription = doc.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, selectedCategory, selectedStatus]);

  // Group documents by status for display
  const pendingDocs = filteredDocuments.filter(
    (d) => d.status === 'pending_signature' || d.status === 'partially_signed'
  );
  const activeDocs = filteredDocuments.filter((d) => d.status === 'active');
  const otherDocs = filteredDocuments.filter(
    (d) =>
      d.status !== 'pending_signature' &&
      d.status !== 'partially_signed' &&
      d.status !== 'active'
  );

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <DocumentFilters
          onSearch={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onStatusChange={setSelectedStatus}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          t={t}
        />
        {canUpload && onUpload && (
          <Button onClick={onUpload} className="ml-4 flex-shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            {t('uploadDocument')}
          </Button>
        )}
      </div>

      {/* Document Lists */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-[var(--color-text-secondary)] opacity-50" />
            <p className="mt-4 text-[var(--color-text-secondary)]">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? t('noDocumentsFiltered')
                : t('noDocuments')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Pending Documents */}
          {pendingDocs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {t('pendingSignature')} ({pendingDocs.length})
              </h2>
              <div className="space-y-3">
                {pendingDocs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DocumentCard
                      document={doc}
                      locale={locale}
                      onView={() => onView(doc)}
                      onDownload={() => onDownload(doc)}
                      onSign={onSign ? () => onSign(doc) : undefined}
                      t={t}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Active Documents */}
          {activeDocs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {t('activeDocuments')} ({activeDocs.length})
              </h2>
              <div className="space-y-3">
                {activeDocs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DocumentCard
                      document={doc}
                      locale={locale}
                      onView={() => onView(doc)}
                      onDownload={() => onDownload(doc)}
                      t={t}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Other Documents */}
          {otherDocs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                {t('otherDocuments')} ({otherDocs.length})
              </h2>
              <div className="space-y-3">
                {otherDocs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DocumentCard
                      document={doc}
                      locale={locale}
                      onView={() => onView(doc)}
                      onDownload={() => onDownload(doc)}
                      t={t}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
