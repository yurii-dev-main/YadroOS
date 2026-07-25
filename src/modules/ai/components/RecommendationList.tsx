import { CheckCircle2 } from 'lucide-react';

import type { Recommendation } from '../types/ai.types';

interface RecommendationListProps {
  recommendations: Recommendation[];
  title?: string;
}

export const RecommendationList = ({ recommendations, title }: RecommendationListProps) => (
  <div className="space-y-4">
    {title && (
      <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">{title}</h3>
    )}
    <ul className="space-y-3">
      {recommendations.map((recommendation) => (
        <li
          key={recommendation.id}
          className="rounded-lg border border-slate-800 bg-slate-900/40 p-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 text-sky-400" />
            <div className="space-y-1">
              <p className="font-medium text-slate-100">{recommendation.title}</p>
              <p className="text-sm text-slate-300">{recommendation.description}</p>
              <span className="text-xs text-slate-500">
                Confidence {(recommendation.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
