import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Funnel,
  FunnelChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { CRMErrorBoundary } from '../components/CRMErrorBoundary';
import { crmService } from '../services/crm.service';
import { CRMAnalyticsSummary } from '../types/crm.types';
import { formatCurrency } from '../utils/crm.utils';

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState<CRMAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await crmService.getAnalytics();
      setSummary(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <CRMErrorBoundary>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">CRM Analytics</h1>
            <p className="text-sm text-slate-400">Track key metrics and team performance.</p>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-400">Loading analytics...</p>}

        {!loading && summary && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  New Clients
                </h2>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.newClients}>
                      <defs>
                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                      <XAxis dataKey="period" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: 12,
                          border: '1px solid rgba(148,163,184,0.3)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorNew)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Funnel
                  </h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart margin={{ top: 20, right: 120, bottom: 20, left: 20 }}>
                        <Tooltip />
                        <Funnel dataKey="value" data={summary.funnel} fill="#3b82f6" isAnimationActive={false}>
                          <LabelList
                            position="right"
                            fill="#e2e8f0"
                            stroke="none"
                            dataKey="stage"
                          />
                          <LabelList
                            position="center"
                            fill="#ffffff"
                            stroke="none"
                            dataKey="value"
                          />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Revenue Forecast
                  </h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={summary.revenueForecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: 12,
                            border: '1px solid rgba(148,163,184,0.3)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#22d3ee"
                          fill="#22d3ee"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Metrics Overview
                </h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-200">
                  <div className="flex items-center justify-between">
                    <dt>Average Deal Size</dt>
                    <dd className="font-semibold text-emerald-400">
                      {formatCurrency(summary.averageDealSize)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>LTV</dt>
                    <dd className="font-semibold text-primary">{formatCurrency(summary.ltv)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Win rate</dt>
                    <dd className="font-semibold text-white">{summary.winRate}%</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Status Distribution
                </h2>
                <div className="mt-4 h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={summary.statusDistribution}
                        dataKey="value"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#3b82f6"
                        label
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Manager Performance
                </h2>
                <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-2">
                  {summary.managerPerformance.map((manager) => (
                    <div
                      key={manager.manager}
                      className="flex items-center justify-between rounded-2xl border border-slate-700/40 bg-slate-900/60 p-3 text-xs text-slate-300"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{manager.manager}</p>
                        <p>Deals: {manager.deals}</p>
                      </div>
                      <div className="text-right">
                        <p>Won: {manager.won}</p>
                        <p className="font-semibold text-emerald-400">
                          {formatCurrency(manager.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CRMErrorBoundary>
  );
};
