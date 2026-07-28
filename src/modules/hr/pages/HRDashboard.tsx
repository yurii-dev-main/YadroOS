import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';
import { DataSourceBadge, DataSourceType } from '../../../components/ui/DataSourceBadge';
import { AttendancePage } from './AttendancePage';
import { EmployeesPage } from './EmployeesPage';
import { LifecyclePage } from './LifecyclePage';
import { PerformancePage } from './PerformancePage';
import { TrainingsPage } from './TrainingsPage';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { CreateTrainingModal } from '../components/CreateTrainingModal';
import { KPIFormModal } from '../components/KPIFormModal';

const tabs = [
  { id: 'employees', label: 'Employees' },
  { id: 'trainings', label: 'Trainings' },
  { id: 'attendance', label: 'Time Tracking' },
  { id: 'performance', label: 'Performance' },
  { id: 'lifecycle', label: 'On/Offboarding' }
] as const;

type TabId = (typeof tabs)[number]['id'];

export const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>('employees');
  const [source, setSource] = useState<DataSourceType>('mock');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-slate-100">HR Module</CardTitle>
            <p className="text-sm text-slate-300">
              Unified personnel management hub: profiles, trainings, time tracking, KPIs.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DataSourceBadge source={source} onSourceChange={setSource} />
            <Button size="sm" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Record
            </Button>
          </div>
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
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-primary/60 hover:text-primary'
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

      {showModal && (
        <>
          {activeTab === 'employees' && (
            <EmployeeFormModal onClose={() => setShowModal(false)} onSubmit={(data) => console.log('Save Employee', data)} />
          )}
          {activeTab === 'trainings' && (
            <CreateTrainingModal onClose={() => setShowModal(false)} onSubmit={(data) => console.log('Save Training', data)} />
          )}
          {activeTab === 'performance' && (
            // Since performance page has KPI and OKR, we just use KPI as the default record for this example
            <KPIFormModal onClose={() => setShowModal(false)} onSubmit={(data) => console.log('Save KPI', data)} />
          )}
          {(activeTab === 'attendance' || activeTab === 'lifecycle') && (
            <EmployeeFormModal onClose={() => setShowModal(false)} onSubmit={(data) => console.log('Fallback to Employee', data)} />
          )}
        </>
      )}
    </div>
  );
};
