'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Deal, DealFormData, MEDDICScores } from '@/types';

interface UseDealsOptions {
  autoFetch?: boolean;
}

export function useDeals(options: UseDealsOptions = { autoFetch: true }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/partners/deals');
      if (!res.ok) throw new Error('Failed to fetch deals');
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoFetch) {
      fetchDeals();
    }
  }, [fetchDeals, options.autoFetch]);

  const createDeal = async (data: DealFormData): Promise<Deal | null> => {
    try {
      const res = await fetch('/api/partners/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create deal');
      }

      const newDeal = await res.json();
      setDeals((prev) => [newDeal.deal, ...prev]);
      return newDeal.deal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const updateDeal = async (dealId: string, updates: Partial<Deal>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/partners/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update deal');

      const updatedDeal = await res.json();
      setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal.deal : d)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const updateMEDDIC = async (dealId: string, scores: Partial<MEDDICScores>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/partners/deals/${dealId}/meddic`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scores),
      });

      if (!res.ok) throw new Error('Failed to update MEDDIC scores');

      const updatedDeal = await res.json();
      setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal.deal : d)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const validateDomain = async (domain: string): Promise<{ conflict: boolean; dealIds: string[] }> => {
    try {
      const res = await fetch('/api/partners/deals/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      if (!res.ok) throw new Error('Failed to validate domain');
      return await res.json();
    } catch {
      return { conflict: false, dealIds: [] };
    }
  };

  const getDeal = (dealId: string): Deal | undefined => {
    return deals.find((d) => d.id === dealId);
  };

  return {
    deals,
    isLoading,
    error,
    fetchDeals,
    createDeal,
    updateDeal,
    updateMEDDIC,
    validateDomain,
    getDeal,
  };
}
