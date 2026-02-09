'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPartnerAvailableStates, requiresQuote } from '@/lib/deals/status-validation';
import type { Deal, DealStatus } from '@/types';
import { Lock } from 'lucide-react';

const STATUS_LABELS: Record<DealStatus, string> = {
  pending_approval: 'Pendiente de Aprobación',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  more_info: 'Más Información Requerida',
  negotiation: 'En Negociación',
  contracting: 'En Contratación',
  awarded: 'Adjudicada',
  won: 'Ganada',
  lost: 'Perdida',
};

export function StatusChangeForm({
  deal,
  hasQuote,
  canChange,
}: {
  deal: Deal;
  hasQuote: boolean;
  canChange: boolean;
}) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState<DealStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Todos los estados post-aprobación disponibles para el partner
  const availableStates = getPartnerAvailableStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStatus) return;

    // Validar requisito de quote
    if (requiresQuote(newStatus) && !hasQuote) {
      setError('Debes crear una cotización primero');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/partners/deals/${deal.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar estado');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!canChange) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <Lock className="h-5 w-5 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Solo el creador o admin pueden cambiar el estado
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-2 text-xs">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
          Cambiar a
        </label>
        <select
          id="status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as DealStatus)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccionar nuevo estado...</option>
          {availableStates.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="¿Por qué cambió el estado?"
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Actualizando...' : 'Actualizar Estado'}
      </button>
    </form>
  );
}
