import { getTranslations } from 'next-intl/server';
import { getCurrentSession } from '@/lib/auth';
import { hasValidCertification, hasSignedRequiredDocs } from '@/lib/redis';
import { DealForm } from '@/components/portal/deals/DealForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface NewDealPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewDealPage({ params }: NewDealPageProps) {
  const { locale } = await params;
  const t = await getTranslations('deals');
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const [hasCert, hasLegal] = await Promise.all([
    hasValidCertification(session.user.id),
    hasSignedRequiredDocs(session.user.id),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('form.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DealForm
            locale={locale}
            hasCertification={hasCert}
            hasSignedLegal={hasLegal}
          />
        </CardContent>
      </Card>
    </div>
  );
}
