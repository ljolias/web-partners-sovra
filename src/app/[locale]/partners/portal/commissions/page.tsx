'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { DollarSign, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { Card, CardContent, Badge, SovraLoader } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { hasPermission } from '@/lib/permissions';
import type { Commission, User, UserRole } from '@/types';

interface CommissionsPageProps {
  params: Promise<{ locale: string }>;
}

interface CommissionWithDeal extends Commission {
  dealName: string;
}

export default function CommissionsPage({ params }: CommissionsPageProps) {
  const { locale } = use(params);
  const t = useTranslations('commissions');
  const router = useRouter();
  const [commissions, setCommissions] = useState<CommissionWithDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccessAndFetch() {
      try {
        // Check user permissions
        const userRes = await fetch('/api/partners/auth/me');
        if (!userRes.ok) {
          router.replace(`/${locale}/partners/login`);
          return;
        }
        const userData = await userRes.json();
        const user = userData.user as User;

        if (!hasPermission(user.role as UserRole, 'commissions:view')) {
          router.replace(`/${locale}/partners/portal`);
          return;
        }

        setIsAuthorized(true);

        // Fetch commissions
        const res = await fetch('/api/partners/commissions');
        if (res.ok) {
          const data = await res.json();
          setCommissions(data.commissions || []);
        }
      } catch (error) {
        console.error('Failed to fetch commissions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccessAndFetch();
  }, [locale, router]);

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

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
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('total')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('pending')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('paid')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {formatCurrency(paidAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      {commissions.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                    {t('deal')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {commissions.map((comm) => {
                  const StatusIcon = statusIcons[comm.status];
                  return (
                    <tr key={comm.id} className="hover:bg-[var(--color-surface-hover)]">
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-[var(--color-text-primary)]">{comm.dealName}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-[var(--color-text-primary)]">
                          {formatCurrency(comm.amount, comm.currency)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant={statusVariants[comm.status]}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {t(comm.status)}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[var(--color-text-secondary)]">
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
            <DollarSign className="mx-auto h-12 w-12 text-[var(--color-text-secondary)] opacity-50" />
            <p className="mt-4 text-[var(--color-text-secondary)]">{t('empty')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
