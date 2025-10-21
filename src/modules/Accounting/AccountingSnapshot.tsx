import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const reports = [
  { name: 'Баланс', amount: '₴1 230 000', status: 'Актуальний' },
  { name: 'Витрати', amount: '₴420 000', status: 'Очікує підтвердження' },
  { name: 'Податки', amount: '₴96 000', status: 'Оплачено' }
];

export const AccountingSnapshot = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {reports.map((report) => (
      <Card key={report.name}>
        <CardHeader>
          <CardTitle>{report.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-semibold text-slate-50">{report.amount}</p>
          <p className="text-xs text-slate-400">{report.status}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);
