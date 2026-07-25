import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { crmService, subscribeToCRMEvents } from '../services/crm.service';
import { useDebouncedValue } from './useDebouncedValue';
import {
  CRMClient,
  CRMClientFilters,
  CRMClientQueryResult,
  CRMClientSort
} from '../types/crm.types';

const defaultFilters: CRMClientFilters = {
  status: 'all',
  industry: 'all',
  assignedTo: 'all',
  dateRange: undefined,
  tagIds: []
};

const defaultSort: CRMClientSort = {
  field: 'name',
  direction: 'asc'
};

export const useClients = () => {
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<CRMClientFilters>(defaultFilters);
  const [sort, setSort] = useState<CRMClientSort>(defaultSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const result: CRMClientQueryResult = await crmService.getClients({
        page,
        pageSize,
        search: debouncedSearch,
        filters,
        sort
      });
      setClients(result.data);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, filters, sort]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const unsubscribe = subscribeToCRMEvents((payload) => {
      if (payload.type === 'clients:updated') {
        fetchClients();
      }
    });
    return unsubscribe;
  }, [fetchClients]);

  const refresh = useCallback(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(async (input: Parameters<typeof crmService.createClient>[0]) => {
    const optimisticClient: CRMClient = {
      ...input,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: input.notes ?? [],
      files: input.files ?? []
    };
    setClients((prev) => [optimisticClient, ...prev]);
    try {
      const client = await crmService.createClient(input);
      setClients((prev) => [client, ...prev.filter((item) => item.id !== optimisticClient.id)]);
      setTotal((prev) => prev + 1);
      return client;
    } catch (err) {
      setClients((prev) => prev.filter((item) => item.id !== optimisticClient.id));
      throw err;
    }
  }, []);

  const updateClient = useCallback(
    async (id: string, updates: Partial<CRMClient>) => {
      const snapshot = [...clients];
      setClients((prev) =>
        prev.map((client) => (client.id === id ? { ...client, ...updates } : client))
      );
      try {
        const updated = await crmService.updateClient(id, updates);
        setClients((prev) => prev.map((client) => (client.id === id ? updated : client)));
        return updated;
      } catch (err) {
        setClients(snapshot);
        throw err;
      }
    },
    [clients]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      const snapshot = [...clients];
      setClients((prev) => prev.filter((client) => client.id !== id));
      try {
        await crmService.deleteClient(id);
        setTotal((prev) => Math.max(0, prev - 1));
      } catch (err) {
        setClients(snapshot);
        throw err;
      }
    },
    [clients]
  );

  const bulkUpdate = useCallback(
    async (ids: string[], updates: Partial<CRMClient>) => {
      const snapshot = [...clients];
      setClients((prev) =>
        prev.map((client) => (ids.includes(client.id) ? { ...client, ...updates } : client))
      );
      try {
        await crmService.bulkUpdate(ids, updates);
        setSelectedIds([]);
      } catch (err) {
        setClients(snapshot);
        throw err;
      }
    },
    [clients]
  );

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      const snapshot = [...clients];
      setClients((prev) => prev.filter((client) => !ids.includes(client.id)));
      try {
        await crmService.bulkDelete(ids);
        setSelectedIds([]);
      } catch (err) {
        setClients(snapshot);
        throw err;
      }
    },
    [clients]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === clients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clients.map((client) => client.id));
    }
  }, [selectedIds.length, clients]);

  const pagination = useMemo(
    () => ({
      page,
      pageSize,
      total,
      setPage,
      setPageSize
    }),
    [page, pageSize, total]
  );

  const state = useMemo(
    () => ({
      clients,
      loading,
      error,
      total,
      search,
      filters,
      sort,
      viewMode,
      selectedIds
    }),
    [clients, loading, error, total, search, filters, sort, viewMode, selectedIds]
  );

  const actions = useMemo(
    () => ({
      setSearch,
      setFilters,
      setSort,
      setViewMode,
      setPage,
      setPageSize,
      toggleSelection,
      toggleSelectAll,
      refresh,
      addClient,
      updateClient,
      deleteClient,
      bulkUpdate,
      bulkDelete
    }),
    [
      setSearch,
      setFilters,
      setSort,
      setViewMode,
      setPage,
      setPageSize,
      toggleSelection,
      toggleSelectAll,
      refresh,
      addClient,
      updateClient,
      deleteClient,
      bulkUpdate,
      bulkDelete
    ]
  );

  return {
    ...state,
    pagination,
    ...actions
  };
};
