import { useEffect, useState } from 'react';

import type { PredictionSummary } from '../types/ai.types';
import { fetchPredictionSummaries } from '../services/ai.service';

export const usePredictions = () => {
  const [predictions, setPredictions] = useState<PredictionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const result = await fetchPredictionSummaries();
        if (!mounted) return;
        setPredictions(result);
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

  return { predictions, loading };
};
