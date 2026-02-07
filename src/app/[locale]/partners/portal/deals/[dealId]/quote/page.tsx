import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { getSession, getUser, getPartner, getDeal, getPricingConfig } from '@/lib/redis/operations';

// Lazy load QuoteBuilder - it's a heavy component with complex calculations
const QuoteBuilder = dynamic(
  () => import('@/components/portal/quotes/QuoteBuilder').then(mod => ({ default: mod.QuoteBuilder })),
  {
    ssr: false, // Quote builder doesn't need SSR
  }
);

interface PageProps {
  params: Promise<{ locale: string; dealId: string }>;
}

export default async function QuotePage({ params }: PageProps) {
  const { locale, dealId } = await params;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get('partner_session')?.value;

  if (!sessionId) {
    redirect(`/${locale}/partners/login`);
  }

  const session = await getSession(sessionId);
  if (!session) {
    redirect(`/${locale}/partners/login`);
  }

  const [user, partner, deal, pricingConfig] = await Promise.all([
    getUser(session.userId),
    getPartner(session.partnerId),
    getDeal(dealId),
    getPricingConfig(),
  ]);

  if (!user || !partner) {
    redirect(`/${locale}/partners/login`);
  }

  if (!deal) {
    redirect(`/${locale}/partners/portal/deals`);
  }

  // Verify deal belongs to partner
  if (deal.partnerId !== partner.id) {
    redirect(`/${locale}/partners/portal/deals`);
  }

  // Check if deal is approved
  if (deal.status !== 'approved') {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/${locale}/partners/portal/deals/${dealId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al deal
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Oportunidad No Aprobada
          </h1>
          <p className="text-gray-600 mb-6">
            Solo puedes crear cotizaciones para oportunidades que han sido aprobadas por Sovra.
          </p>
          {deal.status === 'pending_approval' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Esta oportunidad esta <strong>pendiente de aprobacion</strong>. Te notificaremos cuando sea revisada.
              </p>
            </div>
          )}
          {deal.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Esta oportunidad fue <strong>rechazada</strong>.
                {deal.rejectionReason && (
                  <span className="block mt-2">Razon: {deal.rejectionReason}</span>
                )}
              </p>
            </div>
          )}
          {deal.status === 'more_info' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                Sovra ha solicitado <strong>mas informacion</strong> sobre esta oportunidad.
                {deal.rejectionReason && (
                  <span className="block mt-2">{deal.rejectionReason}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/${locale}/partners/portal/deals/${dealId}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al deal
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Cotizacion</h1>

      <QuoteBuilder
        deal={deal}
        partner={partner}
        pricingConfig={pricingConfig}
        locale={locale}
      />
    </div>
  );
}
