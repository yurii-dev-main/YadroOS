import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { hrService } from '../services/hr.service';
import { usePerformance } from '../hooks/usePerformance';
import { PerformanceDashboard } from '../components/PerformanceDashboard';

export const PerformancePage = () => {
  const employees = useMemo(() => hrService.getEmployees(), []);
  const { kpis, okrs, reviews, highlights, averageScore } = usePerformance();

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">KPI та ефективність</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300">
          Встановлюйте KPI, відстежуйте OKR та проводьте регулярні review. Контролюйте результати всієї команди.
        </CardContent>
      </Card>

      <PerformanceDashboard
        employees={employees}
        kpis={kpis}
        okrs={okrs}
        reviews={reviews}
        highlights={highlights}
        averageScore={averageScore}
      />
    </div>
  );
};
