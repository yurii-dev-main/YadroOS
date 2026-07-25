import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ExchangeRate } from '../types/accounting.types';

interface ExchangeRateWidgetProps {
  exchangeRate: ExchangeRate | null;
  onRefresh?: () => void;
}

export const ExchangeRateWidget = ({ exchangeRate, onRefresh }: ExchangeRateWidgetProps) => {
  return (
    <Card className="border border-slate-800 bg-slate-900/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base text-slate-100">Exchange Rates</CardTitle>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-300">
        {exchangeRate ? (
          <>
            <p className="text-xs text-slate-500">
              Updated: {new Date(exchangeRate.updatedAt).toLocaleString('uk-UA')}
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {Object.entries(exchangeRate.rates).map(([currency, rate]) => (
                <div
                  key={currency}
                  className="rounded-md border border-slate-800 bg-slate-900/80 p-3"
                >
                  <p className="text-xs uppercase text-slate-500">{currency}</p>
                  <p className="text-lg font-semibold text-slate-100">{rate.toFixed(3)}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">Source: {exchangeRate.provider}</p>
          </>
        ) : (
          <p className="text-xs text-slate-500">Exchange rate data will be loaded automatically.</p>
        )}
      </CardContent>
    </Card>
  );
};
