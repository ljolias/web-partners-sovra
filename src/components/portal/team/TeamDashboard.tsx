'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, Briefcase, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { TeamMemberCard } from './TeamMemberCard';
import { formatCurrency } from '@/lib/utils';
import { hasPermission } from '@/lib/permissions';
import type { TeamMemberSummary, User, UserRole } from '@/types';

interface TeamDashboardProps {
  locale: string;
}

export function TeamDashboard({ locale }: TeamDashboardProps) {
  const t = useTranslations('team');
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMemberSummary[]>([]);
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

        if (!hasPermission(user.role as UserRole, 'team:view')) {
          router.replace(`/${locale}/partners/portal`);
          return;
        }

        setIsAuthorized(true);

        // Fetch team data
        const res = await fetch('/api/partners/team');
        if (res.ok) {
          const data = await res.json();
          setTeamMembers(data.teamMembers || []);
        }
      } catch (error) {
        console.error('Failed to fetch team data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccessAndFetch();
  }, [locale, router]);

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  // Calculate aggregate stats
  const totalMembers = teamMembers.length;
  const totalDeals = teamMembers.reduce((sum, m) => sum + m.metrics.totalDeals, 0);
  const totalRevenue = teamMembers.reduce((sum, m) => sum + m.metrics.totalRevenue, 0);
  const certifiedMembers = teamMembers.filter(
    (m) => m.metrics.activeCertificationsCount > 0
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('totalMembers')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('certifiedMembers')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{certifiedMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('teamDeals')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('teamRevenue')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          {t('members')}
        </h2>
        {teamMembers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={member.user.id} member={member} index={index} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-[var(--color-text-secondary)] opacity-50" />
              <p className="mt-4 text-[var(--color-text-secondary)]">{t('empty')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
