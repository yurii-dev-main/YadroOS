/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ReportsDashboard } from '../components/ReportsDashboard';
import { useAccounting } from '../hooks/useAccounting';
import { Transaction } from '../types/accounting.types';

const groupByMonth = (transactions: Transaction[]) => {
  const map = new Map<string, { income: number; expense: number }>();
  transactions.forEach((transaction) => {
    const month = transaction.date.slice(0, 7);
    if (!map.has(month)) {
      map.set(month, { income: 0, expense: 0 });
    }
    const entry = map.get(month)!;
    const amount = Number(transaction.amount) || 0;
    if (transaction.type === 'income') {
      entry.income += amount;
    }
    if (transaction.type === 'expense') {
      entry.expense += amount;
    }
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, values]) => ({ month, ...values }));
};

export const ReportsPage = () => {
  const { reports, cashFlow, forecasts, transactions, categoryBreakdown, cashFlowForecast } =
    useAccounting();
  const [period, setPeriod] = useState<'all' | 'last30' | 'ytd'>('all');

  const filteredTransactions = useMemo(() => {
    if (period === 'all') return transactions;
    const now = new Date();
    let start: Date;
    if (period === 'last30') {
      start = new Date();
      start.setDate(now.getDate() - 30);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return transactions.filter((t) => new Date(t.date) >= start);
  }, [transactions, period]);

  const trend = useMemo(() => groupByMonth(filteredTransactions), [filteredTransactions]);
  const categories = useMemo(
    () =>
      categoryBreakdown.map((category: any) => ({
        name: category.category || category.categoryName || 'Unknown',
        value: category.amount || category.total || 0
      })),
    [categoryBreakdown]
  );
  const forecast = forecasts[0]?.points ?? [];

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet(
      reports.map((report) => ({
        Title: report.title,
        ...report.figures
      }))
    );
    const transactionsSheet = XLSX.utils.json_to_sheet(
      transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        date: transaction.date,
        description: transaction.description
      }))
    );
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
    XLSX.writeFile(workbook, 'accounting-report.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-100">Financial Analytics</h3>
          <p className="text-sm text-slate-500">P&L, Cash Flow, forecasts and expense structures</p>
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="all">All Time</option>
            <option value="last30">Last 30 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
          <Button variant="secondary" onClick={handleExport}>
            Export to Excel
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.type} className="border border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-100">{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              {Object.entries(report.figures).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="uppercase tracking-wide text-slate-500">{key}</span>
                  <span className="font-semibold text-slate-100">{(value || 0).toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <ReportsDashboard
        trend={trend}
        categories={categories}
        cashFlow={cashFlow}
        forecast={forecast}
      />
      <Card className="border border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-100">Cash Flow Forecast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          {cashFlowForecast.map((item) => (
            <div
              key={item.month}
              className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/80 p-3"
            >
              <span className="text-xs uppercase text-slate-500">{item.month}</span>
              <div className="flex items-center gap-4">
                <span className="text-emerald-300">Inflow: {(item.inflow || 0).toFixed(2)}</span>
                <span className="text-rose-300">Outflow: {(item.outflow || 0).toFixed(2)}</span>
                <span className="text-slate-100">
                  Balance: {(item.closingBalance || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
