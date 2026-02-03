'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, DollarSign, Users, Settings, Percent, Check } from 'lucide-react';
import { SovraLoader } from '@/components/ui';
import type { PricingConfig } from '@/types';

interface PricingConfiguratorProps {
  initialConfig: PricingConfig;
}

export function PricingConfigurator({ initialConfig }: PricingConfiguratorProps) {
  const [config, setConfig] = useState<PricingConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch('/api/sovra/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
      alert('Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  const addTier = () => {
    const lastTier = config.sovraGov.tiers[config.sovraGov.tiers.length - 1];
    const newTier = {
      maxPopulation: (lastTier?.maxPopulation || 0) + 1000000,
      pricePerInhabitant: (lastTier?.pricePerInhabitant || 0.10) - 0.02,
    };
    setConfig({
      ...config,
      sovraGov: {
        ...config.sovraGov,
        tiers: [...config.sovraGov.tiers, newTier],
      },
    });
  };

  const removeTier = (index: number) => {
    setConfig({
      ...config,
      sovraGov: {
        ...config.sovraGov,
        tiers: config.sovraGov.tiers.filter((_, i) => i !== index),
      },
    });
  };

  const updateTier = (index: number, field: 'maxPopulation' | 'pricePerInhabitant', value: number) => {
    const newTiers = [...config.sovraGov.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setConfig({
      ...config,
      sovraGov: { ...config.sovraGov, tiers: newTiers },
    });
  };

  const updateSovraId = (plan: 'essentials' | 'professional' | 'enterprise', field: 'monthlyLimit' | 'monthlyPrice', value: number) => {
    setConfig({
      ...config,
      sovraId: {
        ...config.sovraId,
        [plan]: { ...config.sovraId[plan], [field]: value },
      },
    });
  };

  const updateServices = (field: 'walletImplementation' | 'integrationHourlyRate', value: number) => {
    setConfig({
      ...config,
      services: { ...config.services, [field]: value },
    });
  };

  const updateDiscount = (tier: 'bronze' | 'silver' | 'gold' | 'platinum', field: 'base' | 'leadBonus', value: number) => {
    setConfig({
      ...config,
      discounts: {
        ...config.discounts,
        [tier]: { ...config.discounts[tier], [field]: value },
      },
    });
  };

  const formatPopulation = (pop: number): string => {
    if (pop >= 1000000) return `${pop / 1000000}M`;
    if (pop >= 1000) return `${pop / 1000}K`;
    return pop.toString();
  };

  return (
    <div className="space-y-6">
      {/* SovraGov Tiers */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">SovraGov - Precios por Poblacion</h2>
            <p className="text-sm text-gray-500">Configura los precios segun el tamano de la poblacion</p>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {config.sovraGov.tiers.map((tier, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Hasta habitantes</label>
                  <input
                    type="number"
                    value={tier.maxPopulation}
                    onChange={(e) => updateTier(index, 'maxPopulation', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Precio/habitante (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tier.pricePerInhabitant}
                    onChange={(e) => updateTier(index, 'pricePerInhabitant', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="w-20 text-center">
                  <label className="block text-xs text-gray-500 mb-1">Ref.</label>
                  <span className="text-sm text-gray-600">{formatPopulation(tier.maxPopulation)}</span>
                </div>
                <button
                  onClick={() => removeTier(index)}
                  disabled={config.sovraGov.tiers.length <= 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addTier}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar tier
          </button>
        </div>
      </div>

      {/* SovraID Plans */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">SovraID - Planes</h2>
            <p className="text-sm text-gray-500">Configura limites y precios de cada plan</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {(['essentials', 'professional', 'enterprise'] as const).map((plan) => (
              <div key={plan} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 capitalize mb-4">{plan}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Limite mensual</label>
                    <input
                      type="number"
                      value={config.sovraId[plan].monthlyLimit}
                      onChange={(e) => updateSovraId(plan, 'monthlyLimit', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Precio mensual (USD)</label>
                    <input
                      type="number"
                      value={config.sovraId[plan].monthlyPrice}
                      onChange={(e) => updateSovraId(plan, 'monthlyPrice', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Professional Services */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Servicios Profesionales</h2>
            <p className="text-sm text-gray-500">Precios de implementacion e integracion</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Implementacion Wallet (USD)
              </label>
              <input
                type="number"
                value={config.services.walletImplementation}
                onChange={(e) => updateServices('walletImplementation', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarifa por hora de integracion (USD)
              </label>
              <input
                type="number"
                value={config.services.integrationHourlyRate}
                onChange={(e) => updateServices('integrationHourlyRate', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discounts */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Percent className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Descuentos por Tier</h2>
            <p className="text-sm text-gray-500">Configura descuentos base y bonus por lead generado</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tier) => (
              <div key={tier} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 capitalize mb-4">{tier}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Descuento base (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={config.discounts[tier].base}
                      onChange={(e) => updateDiscount(tier, 'base', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bonus lead (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={config.discounts[tier].leadBonus}
                      onChange={(e) => updateDiscount(tier, 'leadBonus', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <SovraLoader size="sm" className="!w-5 !h-5 text-white" />
              Guardando...
            </>
          ) : saved ? (
            <>
              <Save className="w-5 h-5" />
              Guardado!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
}
