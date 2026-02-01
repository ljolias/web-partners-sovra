'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MessageSquare, Clock, Mail, Phone, Globe } from 'lucide-react';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MEDDICDisplay } from './MEDDICDisplay';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Deal } from '@/types';

interface DealDetailProps {
  deal: Deal;
  locale: string;
}

export function DealDetail({ deal, locale }: DealDetailProps) {
  const t = useTranslations('deals');
  const tMeddic = useTranslations('meddic');

  const basePath = `/${locale}/partners/portal/deals`;

  const stageVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    registered: 'default',
    qualified: 'info',
    proposal: 'info',
    negotiation: 'warning',
    closed_won: 'success',
    closed_lost: 'danger',
  };

  const daysUntilExpiry = Math.ceil(
    (new Date(deal.exclusivityExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={basePath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Deal Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{deal.companyName}</CardTitle>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge variant={stageVariants[deal.stage]}>
                      {t(`stages.${deal.stage}`)}
                    </Badge>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(deal.dealValue, deal.currency)}
                    </span>
                  </div>
                </div>
                <Link href={`${basePath}/${deal.id}/copilot`}>
                  <Button>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t('detail.startCopilot')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <span>{deal.companyDomain}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span>
                    {t('detail.exclusivity', { date: formatDate(deal.exclusivityExpiresAt, locale) })}
                    {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                      <Badge variant="warning" className="ml-2">
                        {daysUntilExpiry} days
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-medium text-gray-900">{deal.contactName}</p>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${deal.contactEmail}`} className="hover:text-indigo-600">
                    {deal.contactEmail}
                  </a>
                </div>
                {deal.contactPhone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${deal.contactPhone}`} className="hover:text-indigo-600">
                      {deal.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {deal.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-600">{deal.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - MEDDIC */}
        <div className="w-full lg:w-96">
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
