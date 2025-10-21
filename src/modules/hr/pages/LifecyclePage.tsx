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
          Контролюйте весь життєвий цикл співробітника: від першого дня до фінального розрахунку. Завдання, доступи, документи
          та оснащення під повним контролем HR.
        </CardContent>
      </Card>

      <OnboardingChecklist employees={employees} plans={onboardingPlans} />
      <OffboardingChecklist employees={employees} checklists={offboardingChecklists} />
    </div>
  );
};
