import { getTranslations } from 'next-intl/server';
import { getCurrentSession } from '@/lib/auth';
import { getPartnerDeals } from '@/lib/redis';
import { getPartnerAchievements, getNextTierRequirements } from '@/lib/achievements';
import { StatsCard } from '@/components/portal/dashboard/StatsCard';
import { TierDisplay } from '@/components/portal/dashboard/TierDisplay';
import { RatingFactorsCard } from '@/components/portal/dashboard/RatingFactorsCard';
import { AlertsList } from '@/components/portal/dashboard/AlertsList';
import { RecentDeals } from '@/components/portal/dashboard/RecentDeals';
import { AchievementsSummaryCard } from '@/components/portal/dashboard/AchievementsSummaryCard';
import { Trophy } from 'lucide-react';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');
  const tDeals = await getTranslations('deals');
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const { user, partner } = session;

  const [deals, achievements, nextTierReqs] = await Promise.all([
    getPartnerDeals(partner.id),
    getPartnerAchievements(partner.id),
    getNextTierRequirements(partner.id),
  ]);

  const pendingDeals = deals.filter(
    (d) => d.status === 'pending_approval' || d.status === 'more_info'
  );
  const approvedDeals = deals.filter((d) => d.status === 'approved');
  const wonDeals = deals.filter((d) => d.status === 'closed_won');

  // Generate alerts
  const alerts: { id: string; type: 'warning' | 'info' | 'error'; title: string; message: string }[] = [];

  // Check for pending approvals
  if (pendingDeals.length > 0) {
    alerts.push({
      id: 'pending-deals',
      type: 'info',
      title: 'Oportunidades Pendientes',
      message: `Tienes ${pendingDeals.length} oportunidad(es) pendientes de aprobacion`,
    });
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">{t('welcome', { name: user.name })}</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <AlertsList alerts={alerts} />
      )}

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('stats.totalDeals')}
          value={deals.length}
          iconName="briefcase"
          color="primary"
        />
        <StatsCard
          title="Pendientes"
          value={pendingDeals.length}
          iconName="clock"
          color="orange"
        />
        <StatsCard
          title="Aprobadas"
          value={approvedDeals.length}
          iconName="check-circle"
          color="green"
        />
        <StatsCard
          title={t('stats.wonDeals')}
          value={wonDeals.length}
          iconName="trophy"
          color="purple"
        />
      </div>

      {/* Second Row - Tier and Rewards Summary */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-accent-orange)]" />
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">{t('stats.tier')}</h3>
          </div>
          <TierDisplay tier={partner.tier} size="lg" />
          <RatingFactorsCard className="mt-4 pt-4 border-t border-[var(--color-border)]" />
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <AchievementsSummaryCard
            recentAchievements={achievements.slice(0, 3)}
            nextMilestone={nextTierReqs}
            currentTierName={partner.tier}
          />
        </div>
      </div>

      {/* Recent Deals */}
      <div>
        <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">{t('recentDeals')}</h2>
        <RecentDeals
          deals={deals}
          locale={locale}
          viewAllLabel="Ver todas las oportunidades"
          emptyLabel={tDeals('list.empty')}
        />
      </div>
    </div>
  );
}
