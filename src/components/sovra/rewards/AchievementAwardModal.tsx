'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Search, X } from 'lucide-react';
import { SovraLoader } from '@/components/ui';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';
import type { AchievementCategory } from '@/types/achievements';

import { logger } from '@/lib/logger';
interface PartnerOption {
  id: string;
  companyName: string;
}

type ActionType = 'award' | 'revoke';

export function AchievementAwardModal() {
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<PartnerOption | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<ActionType>('award');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoadingPartners(true);
    try {
      const response = await fetch('/api/sovra/rewards/partners?limit=500');
      if (!response.ok) throw new Error('Failed to load partners');
      const data = await response.json();
      const partnerList = data.partners.map((p: any) => ({
        id: p.id,
        companyName: p.companyName,
      }));
      setPartners(partnerList);
    } catch (err) {
      logger.error('Load partners error:', { error: err });
    } finally {
      setLoadingPartners(false);
    }
  };

  const filteredPartners = partners.filter((p) =>
    p.companyName.toLowerCase().includes(partnerSearch.toLowerCase())
  );

  const categories = Array.from(
    new Set(Object.values(ACHIEVEMENTS).map((a) => a.category))
  ) as AchievementCategory[];

  const categoryAchievements =
    selectedAchievement && ACHIEVEMENTS[selectedAchievement]
      ? Object.values(ACHIEVEMENTS).filter(
          (a) => a.category === ACHIEVEMENTS[selectedAchievement]?.category
        )
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedPartner) throw new Error('Please select a partner');
      if (!selectedAchievement) throw new Error('Please select an achievement');
      if (!reason || reason.length < 10) {
        throw new Error('Reason must be at least 10 characters');
      }

      const endpoint =
        action === 'award'
          ? `/api/sovra/rewards/partners/${selectedPartner.id}/achievements/award`
          : `/api/sovra/rewards/partners/${selectedPartner.id}/achievements/${selectedAchievement}`;

      const method = action === 'award' ? 'POST' : 'DELETE';
      const body = { reason };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} achievement`);
      }

      const achievement = ACHIEVEMENTS[selectedAchievement];
      setSuccessMessage(
        `Achievement ${action === 'award' ? 'awarded' : 'revoked'} successfully: ${achievement.name}`
      );
      setSuccess(true);

      // Reset form
      setTimeout(() => {
        setSelectedPartner(null);
        setSelectedAchievement(null);
        setReason('');
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error ${action}ing achievement`;
      setError(message);
      logger.error('Award/revoke error:', { error: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        Otorgar o Revocar Logros Manualmente
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Action Toggle */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
            Action
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAction('award')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                action === 'award'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
              }`}
            >
              Otorgar Logro
            </button>
            <button
              type="button"
              onClick={() => setAction('revoke')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                action === 'revoke'
                  ? 'bg-red-600 text-white'
                  : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
              }`}
            >
              Revocar Logro
            </button>
          </div>
        </div>

        {/* Partner Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Socio *
          </label>
          <div className="relative">
            {selectedPartner ? (
              <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg">
                <p className="text-[var(--color-text-primary)]">{selectedPartner.companyName}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPartner(null);
                    setPartnerSearch('');
                  }}
                  className="p-1 hover:bg-[var(--color-surface-hover)] rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Buscar socios..."
                    value={partnerSearch}
                    onChange={(e) => {
                      setPartnerSearch(e.target.value);
                      setShowPartnerDropdown(true);
                    }}
                    onFocus={() => setShowPartnerDropdown(true)}
                    className="w-full pl-10 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
                  />
                </div>

                {showPartnerDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {loadingPartners ? (
                      <div className="p-4 flex items-center justify-center">
                        <SovraLoader className="h-5 w-5 text-blue-500" />
                      </div>
                    ) : filteredPartners.length > 0 ? (
                      filteredPartners.map((partner) => (
                        <button
                          key={partner.id}
                          type="button"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setShowPartnerDropdown(false);
                            setPartnerSearch('');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-primary)]"
                        >
                          {partner.companyName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-[var(--color-text-secondary)] text-sm">
                        No se encontraron socios
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Achievement Selection */}
        {selectedPartner && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Logro *
            </label>

            {/* Category Selection */}
            <div className="mb-3 flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    const catAchievements = Object.values(ACHIEVEMENTS).filter(
                      (a) => a.category === category
                    );
                    if (catAchievements.length > 0) {
                      setSelectedAchievement(catAchievements[0].id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    selectedAchievement &&
                    ACHIEVEMENTS[selectedAchievement].category === category
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Achievement List */}
            {selectedAchievement && (
              <div className="grid gap-2">
                {categoryAchievements.map((achievement) => (
                  <button
                    key={achievement.id}
                    type="button"
                    onClick={() => setSelectedAchievement(achievement.id)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedAchievement === achievement.id
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]'
                        : 'bg-[var(--color-bg)] border-[var(--color-border)]'
                    }`}
                  >
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {achievement.name}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {achievement.points} points
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Razon *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explique por que se esta realizando esta accion..."
            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm resize-none"
            rows={3}
          />
          <p
            className={`text-xs mt-1 ${
              reason.length >= 10
                ? 'text-green-600 dark:text-green-400'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {reason.length}/10 caracteres minimo
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 dark:text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            loading ||
            !selectedPartner ||
            !selectedAchievement ||
            !reason ||
            reason.length < 10
          }
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <>
              <SovraLoader className="h-4 w-4 text-blue-500" />
              Procesando...
            </>
          ) : action === 'award' ? (
            'Otorgar Logro'
          ) : (
            'Revocar Logro'
          )}
        </button>
      </form>
    </div>
  );
}
