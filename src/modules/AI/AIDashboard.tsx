import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const insights = [
  {
    title: 'Прогноз доходу',
    description: 'Очікується зростання на 18% наступного кварталу',
    confidence: '89%'
  },
  {
    title: 'Ризики відтоку клієнтів',
    description: '5 акаунтів потребують уваги від менеджерів',
    confidence: '76%'
  },
  {
    title: 'Рекомендації AI',
    description: 'Активуйте маркетингову кампанію для сегменту SMB',
    confidence: '92%'
  }
];

export const AIDashboard = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {insights.map((insight) => (
      <Card key={insight.title}>
        <CardHeader>
          <CardTitle>{insight.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-slate-300">{insight.description}</p>
          <span className="text-xs text-secondary">Впевненість: {insight.confidence}</span>
        </CardContent>
      </Card>
    ))}
  </div>
);
