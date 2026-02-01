import { getCurrentSession } from '@/lib/auth';
import { getPartnerDeals } from '@/lib/redis';
import { DealsList } from '@/components/portal/deals/DealsList';

interface DealsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DealsPage({ params }: DealsPageProps) {
  const { locale } = await params;
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const deals = await getPartnerDeals(session.partner.id);

  return <DealsList deals={deals} locale={locale} />;
}
