import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AttendancePage } from './AttendancePage';
import { EmployeesPage } from './EmployeesPage';
import { LifecyclePage } from './LifecyclePage';
import { PerformancePage } from './PerformancePage';
import { TrainingsPage } from './TrainingsPage';

const tabs = [
  { id: 'employees', label: 'Employees' },
  { id: 'trainings', label: 'Trainings' },
  { id: 'attendance', label: 'Time Tracking' },
  { id: 'performance', label: 'Performance' },
  { id: 'lifecycle', label: 'On/Offboarding' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>('employees');

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-slate-100">HR Module</CardTitle>
          <p className="text-sm text-slate-300">
            Unified personnel management hub: profiles, trainings, time tracking, KPIs, and employee lifecycle.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500/60 hover:text-indigo-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {activeTab === 'employees' && <EmployeesPage />}
      {activeTab === 'trainings' && <TrainingsPage />}
      {activeTab === 'attendance' && <AttendancePage />}
      {activeTab === 'performance' && <PerformancePage />}
      {activeTab === 'lifecycle' && <LifecyclePage />}
    </div>
  );
};
