'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { hasPermission } from '@/lib/permissions';
import type { LegalDocument, LegalSignature, User, UserRole } from '@/types';

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
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signingId, setSigningId] = useState<string | null>(null);
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
        const user = userData.user as User;

        if (!hasPermission(user.role as UserRole, 'legal:view')) {
          router.replace(`/${locale}/partners/portal`);
          return;
        }

        setIsAuthorized(true);

        // Fetch documents
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

    checkAccessAndFetch();
  }, [locale, router]);

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

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const pendingDocs = documents.filter((d) => !d.signed);
  const signedDocs = documents.filter((d) => d.signed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
      </div>

      {/* Pending Documents */}
      {pendingDocs.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          {doc.title[locale] || doc.title.en}
                        </h3>
                        {doc.requiredForDeals && (
                          <Badge variant="warning">{t('required')}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)]">Version {doc.version}</p>
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
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {doc.title[locale] || doc.title.en}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
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
              <FileText className="mx-auto h-12 w-12 text-[var(--color-text-secondary)] opacity-50" />
              <p className="mt-4 text-[var(--color-text-secondary)]">No signed documents yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
