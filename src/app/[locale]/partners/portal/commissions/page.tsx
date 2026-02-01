import { getTranslations } from 'next-intl/server';
import { DollarSign, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth';
import { getPartnerCommissions, getDeal } from '@/lib/redis';
import { Card, CardContent, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

interface CommissionsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CommissionsPage({ params }: CommissionsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('commissions');
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const commissions = await getPartnerCommissions(session.partner.id);

  // Get deal names for commissions
  const commissionsWithDeals = await Promise.all(
    commissions.map(async (comm) => {
      const deal = await getDeal(comm.dealId);
      return {
        ...comm,
        dealName: deal?.companyName || 'Unknown Deal',
      };
    })
  );

  const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);
  const pendingAmount = commissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);
  const paidAmount = commissions
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  const statusVariants: Record<string, 'warning' | 'info' | 'success'> = {
    pending: 'warning',
    approved: 'info',
    paid: 'success',
  };

  const statusIcons: Record<string, typeof Clock> = {
    pending: Clock,
    approved: CheckCircle,
    paid: CreditCard,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('total')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('pending')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('paid')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(paidAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      {commissionsWithDeals.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('deal')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commissionsWithDeals.map((comm) => {
                  const StatusIcon = statusIcons[comm.status];
                  return (
                    <tr key={comm.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-gray-900">{comm.dealName}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-gray-900">
                          {formatCurrency(comm.amount, comm.currency)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant={statusVariants[comm.status]}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {t(comm.status)}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                        {formatDate(comm.paidAt || comm.createdAt, locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">{t('empty')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
