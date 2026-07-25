import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { RecurringTransactionInsight } from '../types/accounting.types';

interface RecurringTransactionsPanelProps {
  insights: RecurringTransactionInsight[];
}

export const RecurringTransactionsPanel = ({ insights }: RecurringTransactionsPanelProps) => (
  <Card className="border border-slate-800 bg-slate-900/60">
    <CardHeader>
      <CardTitle className="text-base text-slate-100">Recurring Payments</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-sm text-slate-300">
      {insights.length ? (
        insights.map((insight) => (
          <div
            key={insight.transactionId}
            className="rounded-md border border-slate-800 bg-slate-900/80 p-3"
          >
            <p className="font-medium text-slate-100">
              {insight.description || 'Recurring transaction'}
            </p>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Next payment: {new Date(insight.nextRun).toLocaleDateString('uk-UA')}</span>
              <span>
                {insight.estimatedAnnualCost.toLocaleString('uk-UA', {
                  style: 'currency',
                  currency: insight.currency
                })}{' '}
                / year
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-slate-500">No recurring transactions configured.</p>
      )}
    </CardContent>
  </Card>
);
