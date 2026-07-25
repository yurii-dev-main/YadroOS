import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../store/authStore';

const stats = [
  { label: 'Active DAO Members', value: '128', delta: '+14%' },
  { label: 'Votes this Month', value: '32', delta: '+6' },
  { label: 'Budget Allocation', value: '₴860 000', delta: '82% used' }
];

export const OverviewPage = () => {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Welcome, {user?.name}</h1>
        <p className="text-sm text-slate-400">
          Overview of your decentralized organization's activity
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle>{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-50">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
