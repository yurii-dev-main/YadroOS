import { Lightbulb, TriangleAlert } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { Recommendation } from '../types/ai.types';

const typeToIcon: Record<Recommendation['type'], typeof Lightbulb> = {
  action: Lightbulb,
  insight: Lightbulb,
  alert: TriangleAlert
};

const typeToColor: Record<Recommendation['type'], string> = {
  action: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  insight: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  alert: 'bg-amber-500/20 text-amber-200 border-amber-500/40'
};

interface AIInsightCardProps {
  recommendation: Recommendation;
}

export const AIInsightCard = ({ recommendation }: AIInsightCardProps) => {
  const Icon = typeToIcon[recommendation.type];
  const badgeClass = typeToColor[recommendation.type];

  return (
    <Card className="h-full border-slate-800/70 bg-slate-900/70">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${badgeClass}`}>
            <Icon size={14} />
            {recommendation.type === 'action'
              ? 'Наступний крок'
              : recommendation.type === 'alert'
                ? 'Попередження'
                : 'Insight'}
          </span>
        </CardTitle>
        <span className="text-xs text-slate-400">Впевненість {(recommendation.confidence * 100).toFixed(0)}%</span>
      </CardHeader>
      <CardContent className="gap-3">
        <h3 className="text-lg font-semibold text-slate-100">{recommendation.title}</h3>
        <p className="text-sm text-slate-300">{recommendation.description}</p>
      </CardContent>
    </Card>
  );
};
