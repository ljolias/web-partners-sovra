import { getTranslations } from 'next-intl/server';
import { getCurrentSession } from '@/lib/auth';
import { getPartnerDeals, getUserCertifications, getPartnerCommissions } from '@/lib/redis';
import { StatsCard } from '@/components/portal/dashboard/StatsCard';
import { RatingDisplay } from '@/components/portal/dashboard/RatingDisplay';
import { AlertsList } from '@/components/portal/dashboard/AlertsList';
import { RecentDeals } from '@/components/portal/dashboard/RecentDeals';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
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
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500">{t('welcome', { name: user.name })}</p>
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
          color="indigo"
        />
        <StatsCard
          title={t('stats.activeDeals')}
          value={activeDeals.length}
          iconName="trending-up"
          color="blue"
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
          color="purple"
        />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {t('stats.rating')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDisplay rating={partner.rating} size="lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-500" />
              {t('stats.certifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{activeCerts.length}</div>
            <p className="text-sm text-gray-500">Active certifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              {t('stats.pendingCommissions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-sm text-gray-500">{pendingCommissions.length} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('recentDeals')}</h2>
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
