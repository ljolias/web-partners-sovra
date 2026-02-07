import { redis } from '../client';
import { keys } from '../keys';
import type { PricingConfig } from '@/types';

const DEFAULT_PRICING_CONFIG: PricingConfig = {
  sovraGov: {
    tiers: [
      { maxPopulation: 100000, pricePerInhabitant: 0.50 },
      { maxPopulation: 250000, pricePerInhabitant: 0.40 },
      { maxPopulation: 500000, pricePerInhabitant: 0.32 },
      { maxPopulation: 1000000, pricePerInhabitant: 0.26 },
      { maxPopulation: 2500000, pricePerInhabitant: 0.20 },
      { maxPopulation: 5000000, pricePerInhabitant: 0.16 },
      { maxPopulation: 10000000, pricePerInhabitant: 0.13 },
    ],
  },
  sovraId: {
    essentials: { monthlyLimit: 10000, monthlyPrice: 1000 },
    professional: { monthlyLimit: 30000, monthlyPrice: 2000 },
    enterprise: { monthlyLimit: 50000, monthlyPrice: 3000 },
  },
  services: {
    walletImplementation: 5000,
    integrationHourlyRate: 150,
  },
  discounts: {
    bronze: { base: 5, leadBonus: 0 },
    silver: { base: 20, leadBonus: 10 },
    gold: { base: 25, leadBonus: 15 },
    platinum: { base: 30, leadBonus: 20 },
  },
};

export async function getPricingConfig(): Promise<PricingConfig> {
  const config = await redis.get<string>(keys.pricingConfig());
  if (!config) {
    // Initialize with default config
    await savePricingConfig(DEFAULT_PRICING_CONFIG);
    return DEFAULT_PRICING_CONFIG;
  }
  return typeof config === 'string' ? JSON.parse(config) : config;
}

export async function savePricingConfig(config: PricingConfig): Promise<void> {
  await redis.set(keys.pricingConfig(), JSON.stringify(config));
}

export async function updatePricingConfig(updates: Partial<PricingConfig>): Promise<PricingConfig> {
  const current = await getPricingConfig();
  const updated = { ...current, ...updates };
  await savePricingConfig(updated);
  return updated;
}

export { DEFAULT_PRICING_CONFIG };
