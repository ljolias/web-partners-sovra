'use client';

import { useState, useEffect } from 'react';
import { Search, DownloadCloud, ArrowUpRight, AlertCircle } from 'lucide-react';
import { SovraLoader } from '@/components/ui';
import { TierChangeModal } from './TierChangeModal';
import type { PartnerTier } from '@/types';

interface Partner {
  id: string;
  companyName: string;
  country: string;
  tier: PartnerTier;
  status: 'active' | 'suspended';
  rating: number;
  totalPoints: number;
  pointsByCategory: Record<string, number>;
  achievementCount: number;
}

const TIER_COLORS: Record<PartnerTier, string> = {
  bronze: 'bg-amber-900 text-amber-100',
  silver: 'bg-gray-600 text-gray-100',
  gold: 'bg-yellow-600 text-yellow-100',
  platinum: 'bg-blue-600 text-blue-100',
};

export function PartnerTierManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<PartnerTier | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'rating' | 'name'>('points');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        ...(selectedTier !== 'all' && { tier: selectedTier }),
        sortBy,
        limit: '100',
      });

      const response = await fetch(`/api/sovra/rewards/partners?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load partners');
      }

      const data = await response.json();
      setPartners(data.partners);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading partners';
      setError(message);
      console.error('Load partners error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = async () => {
    await loadPartners();
    setShowModal(false);
  };

  const filteredPartners = partners.filter(
    (p) =>
      (selectedTier === 'all' || p.tier === selectedTier) &&
      p.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: partners.length,
    avgPoints: Math.round(partners.reduce((sum, p) => sum + p.totalPoints, 0) / partners.length) || 0,
    avgRating: (
      partners.reduce((sum, p) => sum + p.rating, 0) / partners.length
    ).toFixed(1) || '0',
  };

  const exportToCSV = () => {
    const headers = ['Company', 'Country', 'Tier', 'Rating', 'Total Points', 'Achievements'];
    const rows = filteredPartners.map((p) => [
      p.companyName,
      p.country,
      p.tier,
      p.rating.toFixed(2),
      p.totalPoints,
      p.achievementCount,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partners-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && partners.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <SovraLoader className="h-8 w-8" />
          <p className="text-[var(--color-text-secondary)]">Cargando partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
          <p className="text-sm text-[var(--color-text-secondary)]">Total de Partners</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
        </div>
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
          <p className="text-sm text-[var(--color-text-secondary)]">Puntos Promedio</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.avgPoints}</p>
        </div>
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
          <p className="text-sm text-[var(--color-text-secondary)]">Calificacion Promedio</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.avgRating}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Buscar Partners
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar por nombre de empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Filtrar por Nivel
          </label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as PartnerTier | 'all')}
            className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
          >
            <option value="all">Todos los Niveles</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Ordenar Por
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'points' | 'rating' | 'name')}
            className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
          >
            <option value="points">Puntos Totales</option>
            <option value="rating">Calificacion</option>
            <option value="name">Nombre Empresa</option>
          </select>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-all"
        >
          <DownloadCloud className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Partners Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                  Pais
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                  Nivel
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                  Calificacion
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                  Puntos
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-primary)]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredPartners.map((partner) => (
                <tr
                  key={partner.id}
                  className="hover:bg-[var(--color-bg)] transition-colors"
                >
                  <td className="px-6 py-4 text-[var(--color-text-primary)]">
                    {partner.companyName}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                    {partner.country}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${TIER_COLORS[partner.tier]}`}>
                      {partner.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[var(--color-text-primary)]">
                    {partner.rating.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-[var(--color-text-primary)]">
                    {partner.totalPoints}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedPartner(partner);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary)]/90 transition-all text-sm"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      Cambiar Nivel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPartners.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-[var(--color-text-secondary)]">No se encontraron partners</p>
          </div>
        )}
      </div>

      {selectedPartner && (
        <TierChangeModal
          partner={selectedPartner}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleTierChange}
        />
      )}
    </div>
  );
}
