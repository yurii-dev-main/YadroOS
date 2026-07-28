import { useMemo, useState, useEffect } from 'react';
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
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [highlights, setHighlights] = useState<PerformanceHighlight[]>([]);

  useEffect(() => {
    hrService.getKpis().then(setKpis).catch(console.error);
    hrService.getOkrs().then(setOkrs).catch(console.error);
    hrService.getPerformanceReviews().then(setReviews).catch(console.error);
    hrService.getPerformanceHighlights().then(setHighlights).catch(console.error);
  }, []);

  const averageScore = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((acc, item) => acc + item.overallScore, 0) / reviews.length;
  }, [reviews]);

  return {
    kpis,
    okrs,
    reviews,
    highlights,
    averageScore
  };
};
