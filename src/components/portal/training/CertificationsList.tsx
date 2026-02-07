import React from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Certification, CertificationType } from '@/types';

interface CertificationsListProps {
  certifications: Certification[];
  locale: string;
  tCert: (key: string, values?: Record<string, any>) => string;
}

export const CertificationsList = React.memo(function CertificationsList({
  certifications,
  locale,
  tCert,
}: CertificationsListProps) {
  const activeCerts = React.useMemo(
    () =>
      certifications.filter(
        (c) => c.status === 'active' && new Date(c.expiresAt) > new Date()
      ),
    [certifications]
  );

  const expiredCerts = React.useMemo(
    () =>
      certifications.filter(
        (c) => c.status !== 'active' || new Date(c.expiresAt) <= new Date()
      ),
    [certifications]
  );

  const certTypes: CertificationType[] = [
    'sales_fundamentals',
    'technical_specialist',
    'solution_architect',
  ];

  return (
    <div className="space-y-8">
      {/* Active Certifications */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          {tCert('active')}
        </h2>
        {activeCerts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCerts.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            {tCert(`types.${cert.type}`)}
                          </h3>
                          <Badge variant="success">Active</Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <Calendar className="h-4 w-4" />
                          {tCert('validUntil', {
                            date: formatDate(cert.expiresAt, locale),
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="mx-auto h-12 w-12 text-[var(--color-text-secondary)] opacity-50" />
              <p className="mt-4 text-[var(--color-text-secondary)]">
                No active certifications
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Certifications */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          Available Certifications
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certTypes.map((type, index) => {
            const hasCert = activeCerts.some((c) => c.type === type);

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={hasCert ? 'opacity-60' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                          hasCert
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-[var(--color-surface-hover)]'
                        }`}
                      >
                        {hasCert ? (
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Award className="h-6 w-6 text-[var(--color-text-secondary)]" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          {tCert(`types.${type}`)}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {hasCert ? 'Earned' : tCert('earn')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expired Certifications */}
      {expiredCerts.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
            {tCert('expired')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expiredCerts.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-surface-hover)]">
                        <Award className="h-6 w-6 text-[var(--color-text-secondary)]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            {tCert(`types.${cert.type}`)}
                          </h3>
                          <Badge variant="danger">{tCert('expired')}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          Expired on {formatDate(cert.expiresAt, locale)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
