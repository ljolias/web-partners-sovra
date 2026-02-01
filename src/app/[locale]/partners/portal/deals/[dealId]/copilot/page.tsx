'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { CopilotChat } from '@/components/portal/copilot/CopilotChat';
import { MEDDICDisplay } from '@/components/portal/deals/MEDDICDisplay';
import type { Deal, MEDDICScores } from '@/types';

interface CopilotPageProps {
  params: Promise<{ locale: string; dealId: string }>;
}

export default function CopilotPage({ params }: CopilotPageProps) {
  const { locale, dealId } = use(params);
  const router = useRouter();
  const t = useTranslations('copilot');
  const tMeddic = useTranslations('meddic');
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

  const handleScoreUpdate = async (scores: Partial<MEDDICScores>) => {
    if (!deal) return;

    try {
      const res = await fetch(`/api/partners/deals/${dealId}/meddic`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scores),
      });

      if (res.ok) {
        const data = await res.json();
        setDeal(data.deal);
      }
    } catch (error) {
      console.error('Failed to update scores:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
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
          <p className="text-sm text-gray-500">{deal.companyName}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <div className="lg:col-span-2">
          <CopilotChat deal={deal} onScoreUpdate={handleScoreUpdate} />
        </div>

        {/* MEDDIC Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{tMeddic('title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MEDDICDisplay scores={deal.meddic} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
