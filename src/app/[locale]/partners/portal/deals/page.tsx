import { getCurrentSession } from '@/lib/auth';
import { getPartnerDeals, getPartnerUsers } from '@/lib/redis';
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

  const [deals, users] = await Promise.all([
    getPartnerDeals(session.partner.id),
    getPartnerUsers(session.partner.id),
  ]);

  return <DealsList deals={deals} users={users} locale={locale} />;
}
