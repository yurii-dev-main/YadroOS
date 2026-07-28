import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AIInsightCard } from '../components/AIInsightCard';
import { useInsights } from '../hooks/useInsights';
import { usePredictions } from '../hooks/usePredictions';

export const InsightsPage = () => {
  const { insights, loading: insightsLoading, isGeminiConnected } = useInsights();
  const { predictions, loading: predictionsLoading } = usePredictions();

  return (
    <div className="space-y-8">
      {!insightsLoading && !isGeminiConnected && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <p className="text-sm font-medium">
            Connect Gemini AI in the Integrations Hub for deeper insights!
          </p>
        </div>
      )}
      <section className="grid gap-6 lg:grid-cols-2">
        {insightsLoading ? (
          <p className="text-sm text-slate-400">AI is generating recommendations…</p>
        ) : (
          insights.map((group) => (
            <Card key={group.title} className="border-slate-800/60 bg-slate-950/40">
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {group.insights.map((recommendation) => (
                  <AIInsightCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Predictions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {predictionsLoading
              ? [1, 2].map((placeholder) => (
                  <div
                    key={placeholder}
                    className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-4 text-sm text-slate-400"
                  >
                    Analytics processing…
                  </div>
                ))
              : predictions.map((prediction) => (
                  <div
                    key={prediction.title}
                    className="space-y-3 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">{prediction.title}</h3>
                      <p className="text-sm text-slate-300">{prediction.description}</p>
                    </div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Confidence {(prediction.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-400">
                      Forecast horizon: {prediction.forecast.horizonMonths} months
                    </p>
                  </div>
                ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
