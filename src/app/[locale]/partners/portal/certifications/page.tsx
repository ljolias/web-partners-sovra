import { getTranslations } from 'next-intl/server';
import { Award, Calendar, CheckCircle } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth';
import { getUserCertifications } from '@/lib/redis';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface CertificationsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CertificationsPage({ params }: CertificationsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('certifications');
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const certifications = await getUserCertifications(session.user.id);

  const activeCerts = certifications.filter(
    (c) => c.status === 'active' && new Date(c.expiresAt) > new Date()
  );
  const expiredCerts = certifications.filter(
    (c) => c.status !== 'active' || new Date(c.expiresAt) <= new Date()
  );

  const certTypes = ['sales_fundamentals', 'technical_specialist', 'solution_architect'] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      {/* Active Certifications */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('active')}</h2>
        {activeCerts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCerts.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {t(`types.${cert.type}`)}
                        </h3>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {t('validUntil', { date: formatDate(cert.expiresAt, locale) })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No active certifications</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Certifications */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Available Certifications</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certTypes.map((type) => {
            const hasCert = activeCerts.some((c) => c.type === type);

            return (
              <Card key={type} className={hasCert ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        hasCert ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      {hasCert ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Award className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t(`types.${type}`)}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {hasCert ? 'Earned' : t('earn')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Expired Certifications */}
      {expiredCerts.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('expired')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expiredCerts.map((cert) => (
              <Card key={cert.id} className="opacity-60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                      <Award className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {t(`types.${cert.type}`)}
                        </h3>
                        <Badge variant="danger">{t('expired')}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Expired on {formatDate(cert.expiresAt, locale)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
