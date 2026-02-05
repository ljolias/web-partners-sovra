'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { SovraLoader } from '@/components/ui';
import { getTierRequirements } from '@/lib/achievements/tiers';
import type { PartnerTier } from '@/types';

interface TierChangeModalProps {
  partner: {
    id: string;
    companyName: string;
    tier: PartnerTier;
    totalPoints: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TierChangeModal({
  partner,
  isOpen,
  onClose,
  onSuccess,
}: TierChangeModalProps) {
  const [newTier, setNewTier] = useState<PartnerTier>(partner.tier);
  const [reason, setReason] = useState('');
  const [skipRequirements, setSkipRequirements] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentTierReqs = getTierRequirements(partner.tier);
  const newTierReqs = getTierRequirements(newTier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!reason || reason.length < 10) {
        throw new Error('Reason must be at least 10 characters');
      }

      const response = await fetch(
        `/api/sovra/rewards/partners/${partner.id}/tier`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: newTier,
            reason,
            skipRequirements,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change tier');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        setNewTier(partner.tier);
        setReason('');
        setSkipRequirements(false);
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error changing tier';
      setError(message);
      console.error('Tier change error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto border border-[var(--color-border)]">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Cambiar Nivel del Partner
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--color-bg)] rounded transition-colors"
          >
            <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Partner Info */}
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">Partner</p>
            <p className="font-semibold text-[var(--color-text-primary)]">
              {partner.companyName}
            </p>
          </div>

          {/* Current vs New Tier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">Nivel Actual</p>
              <div className="px-3 py-2 bg-[var(--color-bg)] rounded border border-[var(--color-border)]">
                <p className="capitalize font-semibold text-[var(--color-text-primary)]">
                  {partner.tier}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-secondary)] mb-1 block">
                Nuevo Nivel
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as PartnerTier)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] capitalize"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
          </div>

          {/* Benefits Comparison */}
          <div className="p-3 bg-[var(--color-bg)] rounded border border-[var(--color-border)] space-y-2">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Cambio de Beneficios
            </p>
            <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <p>
                Descuento Actual: <span className="font-semibold">{currentTierReqs.benefits.discount}%</span>
              </p>
              <p>
                Nuevo Descuento: <span className="font-semibold">{newTierReqs.benefits.discount}%</span>
              </p>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Razon del Cambio *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this tier change is being made..."
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] text-sm resize-none"
              rows={3}
            />
            <p className={`text-xs mt-1 ${reason.length >= 10 ? 'text-green-600 dark:text-green-400' : 'text-[var(--color-text-secondary)]'}`}>
              {reason.length}/10 caracteres minimo
            </p>
          </div>

          {/* Skip Requirements Checkbox */}
          <label className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <input
              type="checkbox"
              checked={skipRequirements}
              onChange={(e) => setSkipRequirements(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                Omitir Requisitos de Elegibilidad
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                Permitir cambio de nivel incluso si el partner no cumple los requisitos minimos
              </p>
            </div>
          </label>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500 rounded flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-700 dark:text-green-400">
                Tier changed successfully!
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !reason || reason.length < 10}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <SovraLoader className="h-4 w-4" />
                  Cambiando...
                </>
              ) : (
                'Confirmar Cambio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
