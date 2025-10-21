import { useMemo } from 'react';
import { hrService } from '../services/hr.service';
import { KPI, OKR, PerformanceHighlight, PerformanceReview } from '../types/hr.types';

interface UsePerformanceResult {
  kpis: KPI[];
  okrs: OKR[];
  reviews: PerformanceReview[];
  highlights: PerformanceHighlight[];
  averageScore: number;
}

export const usePerformance = (): UsePerformanceResult => {
  const kpis = useMemo(() => hrService.getKpis(), []);
  const okrs = useMemo(() => hrService.getOkrs(), []);
  const reviews = useMemo(() => hrService.getPerformanceReviews(), []);
  const highlights = useMemo(() => hrService.getPerformanceHighlights(), []);

  const averageScore = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((acc, item) => acc + item.overallScore, 0) / reviews.length;
  }, [reviews]);

  return {
    kpis,
    okrs,
    reviews,
    highlights,
    averageScore,
  };
};
