import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const channels = [
  { name: 'Slack', status: 'Онлайн', volume: '134 повідомлення' },
  { name: 'Email', status: 'У черзі', volume: '42 листи' },
  { name: 'Telegram', status: 'Онлайн', volume: '23 повідомлення' }
];

export const CommunicationsCenter = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {channels.map((channel) => (
      <Card key={channel.name}>
        <CardHeader>
          <CardTitle>{channel.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-slate-300">Статус: {channel.status}</p>
          <p className="text-xs text-slate-500">Сьогодні: {channel.volume}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);
