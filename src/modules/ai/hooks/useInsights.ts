import { useEffect, useState } from 'react';

import type { InsightGroup } from '../types/ai.types';
import { fetchInsightGroups } from '../services/ai.service';

export const useInsights = () => {
  const [insights, setInsights] = useState<InsightGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const result = await fetchInsightGroups();
        if (!mounted) return;
        setInsights(result);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { insights, loading };
};
