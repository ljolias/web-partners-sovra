import { notFound } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getDeal } from '@/lib/redis';
import { DealDetail } from '@/components/portal/deals/DealDetail';

interface DealDetailPageProps {
  params: Promise<{ locale: string; dealId: string }>;
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { locale, dealId } = await params;
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const deal = await getDeal(dealId);

  if (!deal || deal.partnerId !== session.partner.id) {
    notFound();
  }

  return <DealDetail deal={deal} locale={locale} />;
}
