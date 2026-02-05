'use client';

import { useState } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { SovraLoader } from '@/components/ui';
import type { RewardsConfig } from '@/lib/redis/rewards';
import type { PartnerTier } from '@/types';

interface TierRequirementsEditorProps {
  config: RewardsConfig;
  onConfigUpdate: (config: RewardsConfig) => void;
}

const TIERS: PartnerTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export function TierRequirementsEditor({
  config,
  onConfigUpdate,
}: TierRequirementsEditorProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState(config);

  const updateTierRequirement = (
    tier: PartnerTier,
    field: string,
    value: unknown
  ) => {
    const tierReq = localConfig.tierRequirements[tier];
    const parts = field.split('.');

    if (parts.length === 1) {
      // Top-level field like minRating
      setLocalConfig({
        ...localConfig,
        tierRequirements: {
          ...localConfig.tierRequirements,
          [tier]: { ...tierReq, [field]: value },
        },
      });
    } else if (parts[0] === 'benefits') {
      // benefits.discount
      setLocalConfig({
        ...localConfig,
        tierRequirements: {
          ...localConfig.tierRequirements,
          [tier]: {
            ...tierReq,
            benefits: { ...tierReq.benefits, [parts[1]]: value },
          },
        },
      });
    } else if (parts[0] === 'annualRequirements') {
      // annualRequirements.*
      setLocalConfig({
        ...localConfig,
        tierRequirements: {
          ...localConfig.tierRequirements,
          [tier]: {
            ...tierReq,
            annualRequirements: {
              ...tierReq.annualRequirements,
              [parts[1]]: value,
            },
          },
        },
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch('/api/sovra/rewards/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localConfig),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save configuration');
      }

      const result = await response.json();
      onConfigUpdate(result.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar la configuracion';
      setError(message);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        Requisitos de Nivel
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {TIERS.map((tier) => {
          const requirement = localConfig.tierRequirements[tier];
          if (!requirement) return null;

          return (
            <div
              key={tier}
              className="p-6 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] capitalize"
            >
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 capitalize">
                {tier} Tier
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Calificacion Minima
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={requirement.minRating}
                    onChange={(e) =>
                      updateTierRequirement(tier, 'minRating', parseInt(e.target.value, 10))
                    }
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Descuento de Partner (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={requirement.benefits.discount}
                    onChange={(e) =>
                      updateTierRequirement(tier, 'benefits.discount', parseInt(e.target.value, 10))
                    }
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
                  />
                </div>

                {/* Annual Requirements */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Empleados Certificados Requeridos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={requirement.annualRequirements.certifiedEmployees}
                    onChange={(e) =>
                      updateTierRequirement(
                        tier,
                        'annualRequirements.certifiedEmployees',
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Oportunidades Requeridas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={requirement.annualRequirements.opportunities}
                    onChange={(e) =>
                      updateTierRequirement(
                        tier,
                        'annualRequirements.opportunities',
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Deals Ganados Requeridos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={requirement.annualRequirements.dealsWon}
                    onChange={(e) =>
                      updateTierRequirement(
                        tier,
                        'annualRequirements.dealsWon',
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <>
              <SovraLoader className="h-4 w-4" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </button>

        {saved && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">Configuracion guardada exitosamente</span>
          </div>
        )}
      </div>
    </div>
  );
}
