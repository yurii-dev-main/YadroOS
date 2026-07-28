import { useState, useEffect } from 'react';
import { hrService } from '../services/hr.service';
import { OffboardingChecklist, OnboardingPlan } from '../types/hr.types';

interface UseLifecycleResult {
  onboardingPlans: OnboardingPlan[];
  offboardingChecklists: OffboardingChecklist[];
  toggleOnboardingTask: (employeeId: string, taskId: string) => void;
  toggleOffboardingTask: (employeeId: string, taskId: string) => void;
}

export const useLifecycle = (): UseLifecycleResult => {
  const [onboardingPlans, setOnboardingPlans] = useState<OnboardingPlan[]>([]);
  const [offboardingChecklists, setOffboardingChecklists] = useState<OffboardingChecklist[]>([]);

  useEffect(() => {
    hrService.getOnboardingPlans().then(setOnboardingPlans).catch(console.error);
    hrService.getOffboardingChecklists().then(setOffboardingChecklists).catch(console.error);
  }, []);

  const toggleOnboardingTask = (employeeId: string, taskId: string) => {
    setOnboardingPlans((plans) =>
      plans.map((plan) => {
        if (plan.employeeId !== employeeId) return plan;
        return {
          ...plan,
          tasks: plan.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        };
      })
    );
  };

  const toggleOffboardingTask = (employeeId: string, taskId: string) => {
    setOffboardingChecklists((checklists) =>
      checklists.map((checklist) => {
        if (checklist.employeeId !== employeeId) return checklist;
        return {
          ...checklist,
          tasks: checklist.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        };
      })
    );
  };

  return {
    onboardingPlans,
    offboardingChecklists,
    toggleOnboardingTask,
    toggleOffboardingTask
  };
};
