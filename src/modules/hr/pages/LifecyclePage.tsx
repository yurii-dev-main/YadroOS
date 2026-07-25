import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { hrService } from '../services/hr.service';
import { useLifecycle } from '../hooks/useLifecycle';
import { OnboardingChecklist } from '../components/OnboardingChecklist';
import { OffboardingChecklist } from '../components/OffboardingChecklist';

export const LifecyclePage = () => {
  const employees = useMemo(() => hrService.getEmployees(), []);
  const { onboardingPlans, offboardingChecklists } = useLifecycle();

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Onboarding / Offboarding</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300">
          Control the entire employee lifecycle: from the first day to the final settlement. Tasks, access, documents,
          and equipment are under full HR control.
        </CardContent>
      </Card>

      <OnboardingChecklist employees={employees} plans={onboardingPlans} />
      <OffboardingChecklist employees={employees} checklists={offboardingChecklists} />
    </div>
  );
};
