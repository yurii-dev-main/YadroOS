import { useMemo } from 'react';
import { hrService } from '../services/hr.service';
import { OffboardingChecklist, OnboardingPlan } from '../types/hr.types';

interface UseLifecycleResult {
  onboardingPlans: OnboardingPlan[];
  offboardingChecklists: OffboardingChecklist[];
}

export const useLifecycle = (): UseLifecycleResult => {
  const onboardingPlans = useMemo(() => hrService.getOnboardingPlans(), []);
  const offboardingChecklists = useMemo(() => hrService.getOffboardingChecklists(), []);

  return {
    onboardingPlans,
    offboardingChecklists
  };
};
