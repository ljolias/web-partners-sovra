import { getTranslations } from 'next-intl/server';
import { getCurrentSession } from '@/lib/auth';
import {
  getPartnerDeals,
  getUserCertifications,
  getTeamPerformance,
  getTopPerformersByDeals,
  getTopPerformersByRevenue,
  getTopPerformersByCertifications,
} from '@/lib/redis';
import { getPartnerAchievements, getNextTierRequirements } from '@/lib/achievements';
import { StatsCard } from '@/components/portal/dashboard/StatsCard';
import { TierDisplay } from '@/components/portal/dashboard/TierDisplay';
import { RatingFactorsCard } from '@/components/portal/dashboard/RatingFactorsCard';
import { AlertsList } from '@/components/portal/dashboard/AlertsList';
import { RecentDeals } from '@/components/portal/dashboard/RecentDeals';
import { AchievementsSummaryCard } from '@/components/portal/dashboard/AchievementsSummaryCard';
import { TrainingSummaryCard } from '@/components/portal/dashboard/TrainingSummaryCard';
import { TeamPerformanceCard } from '@/components/portal/dashboard/TeamPerformanceCard';
import { TeamLeaderboardCard } from '@/components/portal/dashboard/TeamLeaderboardCard';
import { Trophy, Users } from 'lucide-react';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');
  const tDeals = await getTranslations('deals');
  const tTier = await getTranslations('tier');
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const { user, partner } = session;

  // Fetch team data if user is admin
  const isAdmin = user.role === 'admin';

  const [deals, achievements, nextTierReqs, certifications, teamPerformance, topByDeals, topByRevenue, topByCerts] =
    await Promise.all([
      getPartnerDeals(partner.id),
      getPartnerAchievements(partner.id),
      getNextTierRequirements(partner.id),
      getUserCertifications(user.id),
      isAdmin ? getTeamPerformance(partner.id) : Promise.resolve(null),
      isAdmin ? getTopPerformersByDeals(partner.id, 5) : Promise.resolve([]),
      isAdmin ? getTopPerformersByRevenue(partner.id, 5) : Promise.resolve([]),
      isAdmin ? getTopPerformersByCertifications(partner.id, 5) : Promise.resolve([]),
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

      {/* Team Dashboard (Admin Only) */}
      {isAdmin && teamPerformance && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Dashboard del Equipo
            </h2>
          </div>

          {/* Team Performance Overview */}
          <TeamPerformanceCard performance={teamPerformance} />

          {/* Leaderboards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TeamLeaderboardCard
              title="Top por Oportunidades"
              entries={topByDeals}
              icon="briefcase"
              emptyMessage="No hay datos de oportunidades"
            />
            <TeamLeaderboardCard
              title="Top por Revenue"
              entries={topByRevenue}
              icon="trending"
              emptyMessage="No hay datos de revenue"
            />
            <TeamLeaderboardCard
              title="Top por Certificaciones"
              entries={topByCerts}
              icon="award"
              emptyMessage="No hay datos de certificaciones"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--color-border)] pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Mi Desempeño Personal
              </h2>
            </div>
          </div>
        </div>
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

      {/* Second Row - Tier, Achievements and Training (3 equal columns) */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {/* Tier / Partner Level */}
        <div className="h-full flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-accent-orange)]" />
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">{t('stats.tier')}</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <TierDisplay tier={partner.tier} size="lg" />
            <div className="mt-6 w-full space-y-3">
              <div className="rounded-lg bg-[var(--color-surface-hover)] p-3">
                <p className="text-xs text-[var(--color-text-secondary)] text-center">Rating del Partner</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] text-center mt-1">
                  {partner.rating || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Nivel actual: <span className="font-medium text-[var(--color-text-primary)]">{tTier(partner.tier)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements / Logros */}
        <div className="sm:col-span-1">
          <AchievementsSummaryCard
            recentAchievements={achievements.slice(0, 3)}
            nextMilestone={nextTierReqs}
            currentTierName={partner.tier}
          />
        </div>

        {/* Training / Capacitación */}
        <div className="sm:col-span-1">
          <TrainingSummaryCard
            locale={locale}
            certifications={certifications}
            completedModules={0}
            totalModules={10}
            inProgressCourses={0}
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
