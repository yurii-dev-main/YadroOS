import { useCallback, useEffect, useMemo, useState } from 'react';
import localforage from 'localforage';
import { openDB, type IDBPDatabase } from 'idb';

interface PendingAction {
  id: string;
  endpoint: string;
  method: string;
  body: unknown;
  createdAt: number;
}

const DB_NAME = 'crm-offline';
const CLIENTS_STORE = 'clients';
const ACTIONS_STORE = 'pending-actions';

export const useOfflineQueue = () => {
  const [db, setDb] = useState<IDBPDatabase | null>(null);

  useEffect(() => {
    localforage.config({
      name: 'yadroos-cache',
      storeName: 'app-state'
    });

    openDB(DB_NAME, 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(CLIENTS_STORE)) {
          database.createObjectStore(CLIENTS_STORE);
        }
        if (!database.objectStoreNames.contains(ACTIONS_STORE)) {
          database.createObjectStore(ACTIONS_STORE);
        }
      }
    }).then(setDb);
  }, []);

  const ready = useMemo(() => db !== null, [db]);

  const cacheClients = useCallback(
    async (clients: unknown[]) => {
      if (!db) {
        return;
      }
      const tx = db.transaction(CLIENTS_STORE, 'readwrite');
      await tx.store.put(clients, 'recent');
      await tx.done;
    },
    [db]
  );

  const getCachedClients = useCallback(async () => {
    if (!db) {
      return [];
    }
    const tx = db.transaction(CLIENTS_STORE, 'readonly');
    const result = await tx.store.get('recent');
    await tx.done;
    return (result as unknown[]) ?? [];
  }, [db]);

  const enqueueAction = useCallback(
    async (action: PendingAction) => {
      if (!db) {
        return;
      }
      const tx = db.transaction(ACTIONS_STORE, 'readwrite');
      await tx.store.put(action, action.id);
      await tx.done;
    },
    [db]
  );

  const getPendingActions = useCallback(async () => {
    if (!db) {
      return [];
    }
    const tx = db.transaction(ACTIONS_STORE, 'readonly');
    const actions = await tx.store.getAll();
    await tx.done;
    return (actions as PendingAction[]) ?? [];
  }, [db]);

  const clearPendingAction = useCallback(
    async (id: string) => {
      if (!db) {
        return;
      }
      const tx = db.transaction(ACTIONS_STORE, 'readwrite');
      await tx.store.delete(id);
      await tx.done;
    },
    [db]
  );

  return {
    ready,
    cacheClients,
    getCachedClients,
    enqueueAction,
    getPendingActions,
    clearPendingAction
  };
};
