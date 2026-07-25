import { TrendingDown, TrendingUp } from 'lucide-react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ScoreGauge } from '../components/ScoreGauge';
import { RecommendationList } from '../components/RecommendationList';
import { useAI } from '../hooks/useAI';

export const AIDashboardPage = () => {
  const { data, loading, error } = useAI();

  if (loading) {
    return <p className="text-sm text-slate-400">AI analytics loading…</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-red-400">{error ?? 'Failed to load AI analytics.'}</p>;
  }

  const topLead = data.crm.leadScores.at(0);
  const topPerformance = data.hr.performance.at(0);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Lead Quality</CardTitle>
          </CardHeader>
          <CardContent className="items-center">
            {topLead ? (
              <div className="flex w-full flex-col items-center gap-4">
                <ScoreGauge value={topLead.score} label={topLead.lead.name} />
                <div className="grid w-full grid-cols-2 gap-3 text-xs text-slate-400">
                  {topLead.factors.map((factor) => (
                    <div key={factor.label} className="rounded-lg bg-slate-900/40 p-3">
                      <p className="text-slate-200">{factor.value}</p>
                      <p>{factor.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No leads for scoring.</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Customer Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.crm.sentimentTrend}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    domain={[0, 1]}
                    fontSize={12}
                    tickFormatter={(value) => `${Math.round(value * 100)}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ stroke: '#1d4ed8', strokeWidth: 1 }}
                    contentStyle={{ background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #1e293b' }}
                    labelStyle={{ color: '#cbd5f5' }}
                    formatter={(value: number) => `${Math.round(value * 100)}%`}
                  />
                  <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              {data.crm.sentimentSamples.map((sample) => (
                <div key={sample.id} className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
                  <p className="font-medium text-slate-100">
                    {sample.customer}
                    <span className="ml-2 text-xs uppercase text-slate-500">{sample.sentiment}</span>
                  </p>
                  <p>{sample.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Executive Health Score</CardTitle>
          </CardHeader>
          <CardContent className="items-center">
            <ScoreGauge value={data.executive.healthScore} label="Company Health" suffix="" />
            <div className="mt-4 grid w-full gap-3">
              {data.executive.metrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between rounded-lg bg-slate-900/40 p-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-100">{metric.label}</p>
                    <p className="text-slate-400">{metric.value}</p>
                  </div>
                  {typeof metric.change === 'number' && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${metric.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {metric.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {metric.change > 0
                        ? `+${(metric.change * 100).toFixed(1)}%`
                        : `${(metric.change * 100).toFixed(1)}%`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>CRM Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendationList recommendations={data.crm.recommendations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HR Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformance ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">{topPerformance.employeeName}</h3>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Trend: {topPerformance.trend}</p>
                  </div>
                  <span className="text-3xl font-semibold text-emerald-400">{topPerformance.normalizedScore}</span>
                </div>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
                  {topPerformance.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No employee data available.</p>
            )}
            <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Succession Planning</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {data.hr.talentMatches.map((match) => (
                  <li key={match.employeeId}>
                    <span className="font-medium text-slate-100">{match.employeeName}</span> → {match.recommendedRole}
                    <span className="ml-2 text-xs text-slate-500">Match {(match.matchScore * 100).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Forecasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {data.accounting.expenses.map((expense) => (
                <div key={expense.id} className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-4">
                  <p className="text-sm text-slate-300">{expense.statement}</p>
                  {expense.delta !== undefined && (
                    <p className="text-xs text-slate-500">
                      Change: {(expense.delta * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.accounting.forecast.baseline}>
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ stroke: '#f472b6', strokeWidth: 1 }}
                    contentStyle={{ background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #1e293b' }}
                    labelStyle={{ color: '#cbd5f5' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#f472b6" strokeWidth={3} dot={false} name="Baseline" />
                  <Line type="monotone" dataKey="upperBound" stroke="#22d3ee" strokeDasharray="4 4" dot={false} name="Best" />
                  <Line type="monotone" dataKey="lowerBound" stroke="#facc15" strokeDasharray="4 4" dot={false} name="Worst" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Priority Emails</h4>
              <ul className="mt-2 space-y-3 text-sm text-slate-300">
                {data.communications.inbox.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
                    <p className="font-medium text-slate-100">{item.category}</p>
                    <p className="text-xs text-slate-500">Priority: {item.priority}</p>
                    <p>{item.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
            <RecommendationList recommendations={data.communications.autoReplies} title="Quick Replies" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
