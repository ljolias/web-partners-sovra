'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { LegalDocument, LegalSignature } from '@/types';

interface LegalPageProps {
  params: Promise<{ locale: string }>;
}

interface DocumentWithStatus extends LegalDocument {
  signed: boolean;
  signature: LegalSignature | null;
}

export default function LegalPage({ params }: LegalPageProps) {
  const { locale } = use(params);
  const t = useTranslations('legal');
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signingId, setSigningId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch('/api/partners/legal');
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  const handleSign = async (documentId: string) => {
    setSigningId(documentId);
    try {
      const res = await fetch('/api/partners/legal/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId
              ? { ...doc, signed: true, signature: data.signature }
              : doc
          )
        );
      }
    } catch (error) {
      console.error('Failed to sign document:', error);
    } finally {
      setSigningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const pendingDocs = documents.filter((d) => !d.signed);
  const signedDocs = documents.filter((d) => d.signed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      {/* Pending Documents */}
      {pendingDocs.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t('pending')}
          </h2>
          <div className="space-y-4">
            {pendingDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                      <FileText className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {doc.title[locale] || doc.title.en}
                        </h3>
                        {doc.requiredForDeals && (
                          <Badge variant="warning">{t('required')}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Version {doc.version}</p>
                    </div>
                    <Button
                      onClick={() => handleSign(doc.id)}
                      isLoading={signingId === doc.id}
                    >
                      {t('sign')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Signed Documents */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {t('signed')}
        </h2>
        {signedDocs.length > 0 ? (
          <div className="space-y-4">
            {signedDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {doc.title[locale] || doc.title.en}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('signedOn', {
                          date: formatDate(doc.signature?.signedAt || '', locale),
                        })}
                      </p>
                    </div>
                    <Badge variant="success">Signed</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No signed documents yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
