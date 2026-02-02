'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ApprovalQueue from '@/components/sovra/ApprovalQueue';
import type { Deal, Partner } from '@/types';
import { Filter } from 'lucide-react';

export default function ApprovalsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<(Deal & { partner?: Partner })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'more_info'>('pending_approval');

  const fetchDeals = useCallback(async () => {
    try {
      const response = await fetch(`/api/sovra/deals?status=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleApprove = async (dealId: string) => {
    const response = await fetch(`/api/sovra/deals/${dealId}/approve`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to approve deal');
    await fetchDeals();
    router.refresh();
  };

  const handleReject = async (dealId: string, reason: string) => {
    const response = await fetch(`/api/sovra/deals/${dealId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to reject deal');
    await fetchDeals();
    router.refresh();
  };

  const handleRequestInfo = async (dealId: string, message: string) => {
    const response = await fetch(`/api/sovra/deals/${dealId}/request-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to request info');
    await fetchDeals();
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aprobar Oportunidades</h1>
          <p className="text-gray-500">Revisa y aprueba las oportunidades de los partners</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending_approval">Pendientes</option>
            <option value="more_info">Esperando info</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-4">Cargando oportunidades...</p>
        </div>
      ) : (
        <ApprovalQueue
          deals={deals}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestInfo={handleRequestInfo}
        />
      )}
    </div>
  );
}
