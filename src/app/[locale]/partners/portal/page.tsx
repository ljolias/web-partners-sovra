import { getTranslations } from 'next-intl/server';
import { getCurrentSession } from '@/lib/auth';
import { getPartnerDeals, getUserCertifications, getPartnerCommissions } from '@/lib/redis';
import { StatsCard } from '@/components/portal/dashboard/StatsCard';
import { RatingDisplay } from '@/components/portal/dashboard/RatingDisplay';
import { AlertsList } from '@/components/portal/dashboard/AlertsList';
import { RecentDeals } from '@/components/portal/dashboard/RecentDeals';
import { formatCurrency } from '@/lib/utils';
import { Star, Award, DollarSign } from 'lucide-react';

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

  const [deals, certifications, commissionsData] = await Promise.all([
    getPartnerDeals(partner.id),
    getUserCertifications(user.id),
    getPartnerCommissions(partner.id),
  ]);

  const activeDeals = deals.filter(
    (d) => !['closed_won', 'closed_lost'].includes(d.stage)
  );
  const wonDeals = deals.filter((d) => d.stage === 'closed_won');
  const totalRevenue = wonDeals.reduce((sum, d) => sum + d.dealValue, 0);
  const activeCerts = certifications.filter(
    (c) => c.status === 'active' && new Date(c.expiresAt) > new Date()
  );
  const pendingCommissions = commissionsData.filter((c) => c.status === 'pending');
  const pendingAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);

  // Generate alerts
  const alerts: { id: string; type: 'warning' | 'info' | 'error'; title: string; message: string }[] = [];

  // Check for expiring certifications
  activeCerts.forEach((cert) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(cert.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      alerts.push({
        id: `cert-${cert.id}`,
        type: 'warning',
        title: 'Certification Expiring',
        message: t('alerts.certExpiring', { days: daysUntilExpiry }),
      });
    }
  });

  // Check for expiring deal exclusivity
  activeDeals.forEach((deal) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(deal.exclusivityExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      alerts.push({
        id: `deal-${deal.id}`,
        type: 'warning',
        title: 'Exclusivity Expiring',
        message: t('alerts.dealExpiring', { name: deal.companyName, days: daysUntilExpiry }),
      });
    }
  });

  const stageLabels = {
    registered: tDeals('stages.registered'),
    qualified: tDeals('stages.qualified'),
    proposal: tDeals('stages.proposal'),
    negotiation: tDeals('stages.negotiation'),
    closed_won: tDeals('stages.closed_won'),
    closed_lost: tDeals('stages.closed_lost'),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-[#888888]">{t('welcome', { name: user.name })}</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <AlertsList alerts={alerts} />
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('stats.totalDeals')}
          value={deals.length}
          iconName="briefcase"
          color="primary"
        />
        <StatsCard
          title={t('stats.activeDeals')}
          value={activeDeals.length}
          iconName="trending-up"
          color="purple"
        />
        <StatsCard
          title={t('stats.wonDeals')}
          value={wonDeals.length}
          iconName="check-circle"
          color="green"
        />
        <StatsCard
          title={t('stats.totalRevenue')}
          value={formatCurrency(totalRevenue)}
          iconName="dollar-sign"
          color="orange"
        />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#0f0d1a] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-[#f97316]" />
            <h3 className="font-semibold text-white">{t('stats.rating')}</h3>
          </div>
          <RatingDisplay rating={partner.rating} size="lg" />
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0f0d1a] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-[#0099ff]" />
            <h3 className="font-semibold text-white">{t('stats.certifications')}</h3>
          </div>
          <div className="text-3xl font-bold text-white">{activeCerts.length}</div>
          <p className="text-sm text-[#888888]">Active certifications</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0f0d1a] p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-[#22c55e]" />
            <h3 className="font-semibold text-white">{t('stats.pendingCommissions')}</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(pendingAmount)}
          </div>
          <p className="text-sm text-[#888888]">{pendingCommissions.length} pending</p>
        </div>
      </div>

      {/* Recent Deals */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">{t('recentDeals')}</h2>
        <RecentDeals
          deals={deals}
          locale={locale}
          viewAllLabel="View all deals"
          emptyLabel={tDeals('list.empty')}
          stageLabels={stageLabels}
        />
      </div>
    </div>
  );
}
