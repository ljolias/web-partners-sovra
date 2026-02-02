import type { PricingConfig, PartnerTier, QuoteProducts, QuoteServices, QuoteDiscounts, SovraIdPlan } from '@/types';

export interface CalculatePriceParams {
  population: number;
  sovraGovIncluded: boolean;
  sovraIdIncluded: boolean;
  sovraIdPlan: SovraIdPlan;
  walletImplementation: boolean;
  integrationHours: number;
  partnerTier: PartnerTier;
  partnerGeneratedLead: boolean;
}

export interface CalculatedQuote {
  products: QuoteProducts;
  services: QuoteServices;
  discounts: QuoteDiscounts;
  subtotal: number;
  totalDiscount: number;
  total: number;
}

export function getSovraGovPricePerInhabitant(population: number, config: PricingConfig): number {
  // Find the appropriate tier based on population
  const sortedTiers = [...config.sovraGov.tiers].sort((a, b) => a.maxPopulation - b.maxPopulation);

  for (const tier of sortedTiers) {
    if (population <= tier.maxPopulation) {
      return tier.pricePerInhabitant;
    }
  }

  // If population exceeds all tiers, use the last (largest) tier's price
  return sortedTiers[sortedTiers.length - 1]?.pricePerInhabitant || 0.13;
}

export function calculateSovraGovPrice(population: number, config: PricingConfig): { pricePerInhabitant: number; annualPrice: number } {
  const pricePerInhabitant = getSovraGovPricePerInhabitant(population, config);
  const annualPrice = population * pricePerInhabitant;

  return { pricePerInhabitant, annualPrice };
}

export function calculateSovraIdPrice(plan: SovraIdPlan, config: PricingConfig): { monthlyLimit: number; monthlyPrice: number; annualPrice: number } {
  const planConfig = config.sovraId[plan];

  return {
    monthlyLimit: planConfig.monthlyLimit,
    monthlyPrice: planConfig.monthlyPrice,
    annualPrice: planConfig.monthlyPrice * 12,
  };
}

export function calculateDiscounts(
  partnerTier: PartnerTier,
  partnerGeneratedLead: boolean,
  config: PricingConfig
): { basePercent: number; leadBonus: number; totalPercent: number } {
  const tierConfig = config.discounts[partnerTier];

  const basePercent = tierConfig.base;
  const leadBonus = partnerGeneratedLead ? tierConfig.leadBonus : 0;
  const totalPercent = basePercent + leadBonus;

  return { basePercent, leadBonus, totalPercent };
}

export function calculateQuote(params: CalculatePriceParams, config: PricingConfig): CalculatedQuote {
  // Calculate SovraGov
  const sovraGovCalc = calculateSovraGovPrice(params.population, config);
  const sovraGovAnnual = params.sovraGovIncluded ? sovraGovCalc.annualPrice : 0;

  // Calculate SovraID
  const sovraIdCalc = calculateSovraIdPrice(params.sovraIdPlan, config);
  const sovraIdAnnual = params.sovraIdIncluded ? sovraIdCalc.annualPrice : 0;

  // Calculate Services
  const walletPrice = params.walletImplementation ? config.services.walletImplementation : 0;
  const integrationTotal = params.integrationHours * config.services.integrationHourlyRate;

  // Products
  const products: QuoteProducts = {
    sovraGov: {
      included: params.sovraGovIncluded,
      populationUsed: params.population,
      pricePerInhabitant: sovraGovCalc.pricePerInhabitant,
      annualPrice: params.sovraGovIncluded ? sovraGovCalc.annualPrice : 0,
    },
    sovraId: {
      included: params.sovraIdIncluded,
      plan: params.sovraIdPlan,
      monthlyLimit: sovraIdCalc.monthlyLimit,
      monthlyPrice: sovraIdCalc.monthlyPrice,
      annualPrice: params.sovraIdIncluded ? sovraIdCalc.annualPrice : 0,
    },
  };

  // Services
  const services: QuoteServices = {
    walletImplementation: params.walletImplementation,
    walletPrice,
    integrationHours: params.integrationHours,
    integrationPricePerHour: config.services.integrationHourlyRate,
    integrationTotal,
  };

  // Subtotal
  const subtotal = sovraGovAnnual + sovraIdAnnual + walletPrice + integrationTotal;

  // Discounts
  const discountCalc = calculateDiscounts(params.partnerTier, params.partnerGeneratedLead, config);
  const discountAmount = subtotal * (discountCalc.totalPercent / 100);

  const discounts: QuoteDiscounts = {
    partnerTier: params.partnerTier,
    partnerGeneratedLead: params.partnerGeneratedLead,
    baseDiscountPercent: discountCalc.basePercent,
    leadBonusPercent: discountCalc.leadBonus,
    totalDiscountPercent: discountCalc.totalPercent,
    discountAmount,
  };

  // Total
  const total = subtotal - discountAmount;

  return {
    products,
    services,
    discounts,
    subtotal,
    totalDiscount: discountAmount,
    total,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPopulation(population: number): string {
  if (population >= 1000000) {
    return `${(population / 1000000).toFixed(1)}M`;
  }
  if (population >= 1000) {
    return `${(population / 1000).toFixed(0)}K`;
  }
  return population.toLocaleString();
}
