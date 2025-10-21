import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const positions = [
  { role: 'Frontend Engineer', candidates: 12, stage: "Інтерв'ю" },
  { role: 'Product Manager', candidates: 8, stage: 'Скринінг' },
  { role: 'Data Analyst', candidates: 5, stage: 'Пропозиція' }
];

export const HRTalentBoard = () => (
  <div className="space-y-4">
    {positions.map((position) => (
      <Card key={position.role}>
        <CardHeader>
          <CardTitle>{position.role}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm text-slate-300">
          <span>Кандидатів: {position.candidates}</span>
          <span>Етап: {position.stage}</span>
        </CardContent>
      </Card>
    ))}
  </div>
);
