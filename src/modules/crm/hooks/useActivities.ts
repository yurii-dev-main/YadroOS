import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { crmService, subscribeToCRMEvents } from '../services/crm.service';
import { CRMActivity, ActivityType } from '../types/crm.types';

export const useActivities = (clientId?: string) => {
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await crmService.getActivities(clientId);
      setActivities(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    const unsubscribe = subscribeToCRMEvents((payload) => {
      if (payload.type === 'activities:updated') {
        if (!clientId || !payload.resourceId || payload.resourceId === clientId) {
          fetchActivities();
        }
      }
    });
    return unsubscribe;
  }, [fetchActivities, clientId]);

  const addActivity = useCallback(async (activity: Omit<CRMActivity, 'id' | 'createdAt'>) => {
    const optimistic: CRMActivity = {
      ...activity,
      id: uuid(),
      createdAt: new Date().toISOString()
    } as CRMActivity;
    setActivities((prev) => [optimistic, ...prev]);
    try {
      const created = await crmService.createActivity(activity);
      setActivities((prev) => [created, ...prev.filter((item) => item.id !== optimistic.id)]);
      return created;
    } catch (err) {
      setActivities((prev) => prev.filter((item) => item.id !== optimistic.id));
      throw err;
    }
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter((activity) => activity.type === filter);
  }, [activities, filter]);

  return {
    activities: filtered,
    allActivities: activities,
    filter,
    setFilter,
    loading,
    error,
    fetchActivities,
    addActivity
  };
};
