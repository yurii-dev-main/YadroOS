import { useEffect, useState } from 'react';

import type { AIOverviewData } from '../types/ai.types';
import { fetchAIOverview } from '../services/ai.service';

interface UseAIState {
  data: AIOverviewData | null;
  loading: boolean;
  error: string | null;
}

export const useAI = () => {
  const [state, setState] = useState<UseAIState>({ data: null, loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const overview = await fetchAIOverview();
        if (!mounted) return;
        setState({ data: overview, loading: false, error: null });
      } catch (error) {
        if (!mounted) return;
        setState({ data: null, loading: false, error: 'Failed to load AI data' });
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return state;
};
