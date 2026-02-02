import { getPricingConfig } from '@/lib/redis/operations';
import { PricingConfigurator } from '@/components/sovra/PricingConfigurator';

export default async function PricingPage() {
  const config = await getPricingConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Configuracion de Precios</h1>
        <p className="text-[var(--color-text-secondary)]">Administra los precios de productos, servicios y descuentos</p>
      </div>

      <PricingConfigurator initialConfig={config} />
    </div>
  );
}
