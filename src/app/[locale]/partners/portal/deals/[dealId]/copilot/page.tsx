'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, SovraLoader } from '@/components/ui';
import { CopilotChat } from '@/components/portal/copilot/CopilotChat';
import type { Deal } from '@/types';

interface CopilotPageProps {
  params: Promise<{ locale: string; dealId: string }>;
}

export default function CopilotPage({ params }: CopilotPageProps) {
  const { locale, dealId } = use(params);
  const router = useRouter();
  const t = useTranslations('copilot');
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await fetch(`/api/partners/deals/${dealId}`);
        if (res.ok) {
          const data = await res.json();
          setDeal(data.deal);
        } else {
          router.push(`/${locale}/partners/portal/deals`);
        }
      } catch {
        router.push(`/${locale}/partners/portal/deals`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDeal();
  }, [dealId, locale, router]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!deal) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/partners/portal/deals/${dealId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deal
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500">{deal.clientName}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <div className="lg:col-span-2">
          <CopilotChat deal={deal} />
        </div>

        {/* Deal Info Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informacion del Deal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">{deal.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pais</p>
                <p className="font-medium">{deal.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Poblacion</p>
                <p className="font-medium">{deal.population.toLocaleString()} habitantes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contacto</p>
                <p className="font-medium">{deal.contactName}</p>
                <p className="text-sm text-gray-600">{deal.contactRole}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
