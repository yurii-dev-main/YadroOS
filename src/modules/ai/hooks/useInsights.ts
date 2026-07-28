import { useEffect, useState } from 'react';

import type { InsightGroup } from '../types/ai.types';
import { fetchInsightGroups } from '../services/ai.service';

export const useInsights = () => {
  const [insights, setInsights] = useState<InsightGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeminiConnected, setIsGeminiConnected] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { groups, isGeminiConnected } = await fetchInsightGroups();
        if (!mounted) return;
        setInsights(groups);
        setIsGeminiConnected(isGeminiConnected);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { insights, loading, isGeminiConnected };
};
