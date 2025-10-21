import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const metrics = [
  { label: 'Активні угоди', value: '24', trend: '+5% за тиждень' },
  { label: 'Нові ліди', value: '58', trend: '+12% за тиждень' },
  { label: 'Конверсія', value: '32%', trend: '+3% за тиждень' }
];

export const CRMOverview = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {metrics.map((metric) => (
      <Card key={metric.label}>
        <CardHeader>
          <CardTitle>{metric.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-slate-50">{metric.value}</p>
          <p className="text-sm text-success">{metric.trend}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);
