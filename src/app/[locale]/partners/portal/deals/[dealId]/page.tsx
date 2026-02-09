import { notFound } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getDeal, dealHasQuote, getDealStatusHistory } from '@/lib/redis/operations/deals';
import { getDealQuotes } from '@/lib/redis/operations/quotes';
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

  // Obtener datos adicionales para el nuevo sistema de estados
  const hasQuote = await dealHasQuote(dealId);
  const statusHistory = await getDealStatusHistory(dealId);
  const quotes = await getDealQuotes(dealId);

  // Verificar si el usuario puede cambiar el estado
  const canChangeStatus = deal.createdBy === session.user.id || session.user.role === 'admin';

  return (
    <DealDetail
      deal={deal}
      locale={locale}
      hasQuote={hasQuote}
      statusHistory={statusHistory}
      canChangeStatus={canChangeStatus}
      quotes={quotes}
    />
  );
}
