import { useState } from 'react';
import { Bot, ChartBar, Lightbulb } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { usePermissions } from '../../hooks/usePermissions';
import { AIDashboardPage, ChatPage, InsightsPage } from '../../modules/ai';

const tabs = [
  { id: 'dashboard', label: 'AI Дашборд', icon: ChartBar },
  { id: 'insights', label: 'AI Інсайти', icon: Lightbulb },
  { id: 'assistant', label: 'AI Асистент', icon: Bot }
] as const;

type TabId = (typeof tabs)[number]['id'];

export const AISuitePage = () => {
  const { can } = usePermissions();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  if (!can('ai:read')) {
    return <p className="text-sm text-danger">Недостатньо прав для перегляду AI аналітики.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className={`gap-2 ${isActive ? 'bg-sky-500 text-white hover:bg-sky-500/90' : 'border-slate-800/60 bg-slate-900/40 text-slate-200'}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {activeTab === 'dashboard' && <AIDashboardPage />}
      {activeTab === 'insights' && <InsightsPage />}
      {activeTab === 'assistant' && <ChatPage />}
    </div>
  );
};
