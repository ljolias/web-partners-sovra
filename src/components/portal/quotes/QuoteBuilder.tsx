'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, FileText, Download } from 'lucide-react';
import { SovraLoader } from '@/components/ui';
import { calculateQuote, formatCurrency, formatPopulation, type CalculatePriceParams, type CalculatedQuote } from '@/lib/pricing/calculator';
import type { Deal, Partner, PricingConfig, SovraIdPlan } from '@/types';

import { logger } from '@/lib/logger';
interface QuoteBuilderProps {
  deal: Deal;
  partner: Partner;
  pricingConfig: PricingConfig;
  locale: string;
}

const SOVRA_ID_PLANS: { value: SovraIdPlan; label: string; description: string }[] = [
  { value: 'essentials', label: 'Essentials', description: 'Ideal para empezar' },
  { value: 'professional', label: 'Professional', description: 'Para gobiernos en crecimiento' },
  { value: 'enterprise', label: 'Enterprise', description: 'Maximo poder y flexibilidad' },
];

export function QuoteBuilder({ deal, partner, pricingConfig, locale }: QuoteBuilderProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);

  // Form state
  const [sovraGovIncluded, setSovraGovIncluded] = useState(true);
  const [sovraIdIncluded, setSovraIdIncluded] = useState(true);
  const [sovraIdPlan, setSovraIdPlan] = useState<SovraIdPlan>('professional');
  const [walletImplementation, setWalletImplementation] = useState(false);
  const [integrationHours, setIntegrationHours] = useState(0);

  // Calculated quote
  const [quote, setQuote] = useState<CalculatedQuote | null>(null);

  // Calculate quote when inputs change
  useEffect(() => {
    const params: CalculatePriceParams = {
      population: deal.population,
      sovraGovIncluded,
      sovraIdIncluded,
      sovraIdPlan,
      walletImplementation,
      integrationHours,
      partnerTier: partner.tier,
      partnerGeneratedLead: deal.partnerGeneratedLead,
    };

    const calculated = calculateQuote(params, pricingConfig);
    setQuote(calculated);
  }, [deal.population, deal.partnerGeneratedLead, partner.tier, pricingConfig, sovraGovIncluded, sovraIdIncluded, sovraIdPlan, walletImplementation, integrationHours]);

  const handleCreateQuote = async () => {
    if (!quote) return;

    setIsCreating(true);

    try {
      const response = await fetch('/api/partners/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          products: quote.products,
          services: quote.services,
          discounts: quote.discounts,
          subtotal: quote.subtotal,
          totalDiscount: quote.totalDiscount,
          total: quote.total,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create quote');
      }

      const { quote: createdQuote } = await response.json();
      setCreatedQuoteId(createdQuote.id);
    } catch (error) {
      logger.error('Error creating quote:', { error: error });
      alert('Error al crear la cotizacion');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!createdQuoteId) return;
    window.open(`/api/partners/quotes/${createdQuoteId}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Deal Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">{deal.clientName}</h2>
        <p className="text-blue-100">
          {deal.country} - {deal.governmentLevel === 'municipality' ? 'Municipio' : deal.governmentLevel === 'province' ? 'Provincia' : 'Nacional'}
        </p>
        <p className="text-2xl font-bold mt-2">{formatPopulation(deal.population)} habitantes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* SovraGov */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">SovraGov</h3>
                <p className="text-sm text-gray-500">Plataforma de gobierno digital</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sovraGovIncluded}
                  onChange={(e) => setSovraGovIncluded(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {sovraGovIncluded && quote && (
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio por habitante</span>
                  <span className="font-medium">{formatCurrency(quote.products.sovraGov.pricePerInhabitant)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Poblacion</span>
                  <span className="font-medium">{formatPopulation(deal.population)}</span>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Precio anual</span>
                  <span className="font-bold text-blue-600">{formatCurrency(quote.products.sovraGov.annualPrice)}</span>
                </div>
              </div>
            )}
          </div>

          {/* SovraID */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">SovraID</h3>
                <p className="text-sm text-gray-500">Identidad digital ciudadana</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sovraIdIncluded}
                  onChange={(e) => setSovraIdIncluded(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {sovraIdIncluded && quote && (
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {SOVRA_ID_PLANS.map((plan) => {
                    const planConfig = pricingConfig.sovraId[plan.value];
                    const isSelected = sovraIdPlan === plan.value;

                    return (
                      <button
                        key={plan.value}
                        onClick={() => setSovraIdPlan(plan.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{plan.label}</span>
                          {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{plan.description}</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(planConfig.monthlyPrice)}/mes
                        </p>
                        <p className="text-xs text-gray-500">
                          Hasta {planConfig.monthlyLimit.toLocaleString()} verificaciones/mes
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Precio anual</span>
                  <span className="font-bold text-blue-600">{formatCurrency(quote.products.sovraId.annualPrice)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Professional Services */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Servicios Profesionales</h3>
              <p className="text-sm text-gray-500">Implementacion e integracion</p>
            </div>
            <div className="p-4 space-y-4">
              {/* Wallet Implementation */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Implementacion Wallet</p>
                  <p className="text-sm text-gray-500">{formatCurrency(pricingConfig.services.walletImplementation)}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walletImplementation}
                    onChange={(e) => setWalletImplementation(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Integration Hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Horas de Integracion</p>
                  <p className="text-sm text-gray-500">{formatCurrency(pricingConfig.services.integrationHourlyRate)}/hora</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={integrationHours}
                    onChange={(e) => setIntegrationHours(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg font-bold text-gray-900 w-16 text-right">{integrationHours}h</span>
                </div>
                {integrationHours > 0 && quote && (
                  <p className="text-sm text-gray-600 mt-2">
                    Total: {formatCurrency(quote.services.integrationTotal)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 sticky top-24">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Resumen de Cotizacion</h3>
            </div>
            {quote && (
              <div className="p-4 space-y-4">
                {/* Line items */}
                {quote.products.sovraGov.included && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SovraGov</span>
                    <span className="font-medium">{formatCurrency(quote.products.sovraGov.annualPrice)}</span>
                  </div>
                )}
                {quote.products.sovraId.included && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SovraID ({quote.products.sovraId.plan})</span>
                    <span className="font-medium">{formatCurrency(quote.products.sovraId.annualPrice)}</span>
                  </div>
                )}
                {quote.services.walletImplementation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Implementacion Wallet</span>
                    <span className="font-medium">{formatCurrency(quote.services.walletPrice)}</span>
                  </div>
                )}
                {quote.services.integrationHours > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Integracion ({quote.services.integrationHours}h)</span>
                    <span className="font-medium">{formatCurrency(quote.services.integrationTotal)}</span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-gray-900">Subtotal</span>
                  <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                </div>

                {/* Discount */}
                {quote.discounts.totalDiscountPercent > 0 && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm text-green-800">
                      <span>Descuento Partner ({partner.tier})</span>
                      <span>-{quote.discounts.baseDiscountPercent}%</span>
                    </div>
                    {quote.discounts.leadBonusPercent > 0 && (
                      <div className="flex justify-between text-sm text-green-800 mt-1">
                        <span>Bonus Lead Generado</span>
                        <span>-{quote.discounts.leadBonusPercent}%</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-green-900 mt-2 pt-2 border-t border-green-200">
                      <span>Descuento total</span>
                      <span>-{formatCurrency(quote.discounts.discountAmount)}</span>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(quote.total)}</span>
                </div>
                <p className="text-xs text-gray-500 text-right">USD / ano</p>

                {/* Actions */}
                {!createdQuoteId ? (
                  <button
                    onClick={handleCreateQuote}
                    disabled={isCreating || quote.subtotal === 0}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <SovraLoader size="sm" className="!w-4 !h-4 text-white" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Crear Cotizacion
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <Check className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-green-800">Cotizacion creada</p>
                    </div>
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Descargar PDF
                    </button>
                    <button
                      onClick={() => router.push(`/${locale}/partners/portal/deals/${deal.id}`)}
                      className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Volver al deal
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
