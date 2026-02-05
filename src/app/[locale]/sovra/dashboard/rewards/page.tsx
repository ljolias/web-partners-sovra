import { getRewardsConfig } from '@/lib/redis/rewards';
import { RewardsManager } from '@/components/sovra/rewards/RewardsManager';

export default async function RewardsPage() {
  // Get rewards configuration
  const config = await getRewardsConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Gestion de Recompensas</h1>
        <p className="text-[var(--color-text-secondary)]">Administra puntos de logros, requisitos de niveles y recompensas de partners</p>
      </div>

      <RewardsManager initialConfig={config} />
    </div>
  );
}
