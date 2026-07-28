import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { crmService, subscribeToCRMEvents } from '../services/crm.service';
import { groupDealsByStage } from '../utils/crm.utils';
import { CRMDeal, CRMPipelineFilters, DealStage } from '../types/crm.types';

export const useDeals = () => {
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [filters, setFilters] = useState<CRMPipelineFilters>({ assignedTo: 'all' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(
    async (background = false) => {
      try {
        if (!background) setLoading(true);
        const response = await crmService.getDeals(filters);
        setDeals(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch deals');
      } finally {
        if (!background) setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchDeals(false);
  }, [fetchDeals]);

  useEffect(() => {
    const unsubscribe = subscribeToCRMEvents((payload) => {
      if (payload.type === 'deals:updated') {
        fetchDeals(true);
      }
    });
    return unsubscribe;
  }, [fetchDeals]);

  const moveDeal = useCallback(
    async (dealId: string, stage: DealStage) => {
      const snapshot = [...deals];
      setDeals((prev) => prev.map((deal) => (deal.id === dealId ? { ...deal, stage } : deal)));
      try {
        await crmService.updateDealStage(dealId, stage);
      } catch (err) {
        setDeals(snapshot);
        throw err;
      }
    },
    [deals]
  );

  const updateDeal = useCallback(
    async (dealId: string, updates: Partial<CRMDeal>) => {
      const snapshot = [...deals];
      setDeals((prev) => prev.map((deal) => (deal.id === dealId ? { ...deal, ...updates } : deal)));
      try {
        await crmService.updateDeal(dealId, updates);
      } catch (err) {
        setDeals(snapshot);
        throw err;
      }
    },
    [deals]
  );

  const addDeal = useCallback(
    async (input: Omit<CRMDeal, 'id' | 'createdAt' | 'updatedAt' | 'clientName'>) => {
      const optimistic: CRMDeal = {
        ...input,
        id: uuid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientName: '—'
      };
      setDeals((prev) => [optimistic, ...prev]);
      try {
        const created = await crmService.createDeal(input);
        setDeals((prev) => [created, ...prev.filter((deal) => deal.id !== optimistic.id)]);
        return created;
      } catch (err) {
        setDeals((prev) => prev.filter((deal) => deal.id !== optimistic.id));
        throw err;
      }
    },
    []
  );

  const grouped = useMemo(() => groupDealsByStage(deals), [deals]);

  return {
    deals,
    grouped,
    filters,
    setFilters,
    loading,
    error,
    fetchDeals,
    moveDeal,
    updateDeal,
    addDeal
  };
};
