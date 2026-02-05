import { cookies } from 'next/headers';
import { getSession, getUser } from '@/lib/redis/operations';
import { getRewardsConfig } from '@/lib/redis/rewards';
import { RewardsManager } from '@/components/sovra/rewards/RewardsManager';
import SovraShell from '@/components/sovra/SovraShell';
import { Trophy } from 'lucide-react';

export default async function RewardsPage({
  params,
}: {
  params: { locale: string };
}) {
  // Verify user is sovra_admin
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('partner_session')?.value;

  if (!sessionId) {
    return <div>Not authenticated</div>;
  }

  const session = await getSession(sessionId);
  if (!session) {
    return <div>Session invalid</div>;
  }

  const user = await getUser(session.userId);
  if (!user || user.role !== 'sovra_admin') {
    return <div>Unauthorized: Only sovra_admin can access this page</div>;
  }

  // Get rewards configuration
  const config = await getRewardsConfig();

  return (
    <SovraShell user={user} locale={params.locale}>
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-[var(--color-primary)]" />
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                Rewards Management
              </h1>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              Manage achievement points, tier requirements, and partner rewards
            </p>
          </div>

          {/* Main Content */}
          <RewardsManager initialConfig={config} />
        </div>
      </div>
    </SovraShell>
  );
}
