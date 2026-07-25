import { useMemo, useState } from 'react';
import { hrService } from '../services/hr.service';
import { Training, TrainingStatus } from '../types/hr.types';

export interface TrainingFilters {
  status?: TrainingStatus;
}

interface UseTrainingsResult {
  trainings: Training[];
  selectedTraining?: Training;
  filters: TrainingFilters;
  setFilters: (filters: TrainingFilters) => void;
  selectTraining: (id: string | null) => void;
  register: (trainingId: string, employeeId: string) => void;
  markAttendance: (trainingId: string, employeeId: string, attended: boolean) => void;
  submitFeedback: (trainingId: string, employeeId: string, rating: number, comments: string) => void;
}

export const useTrainings = (): UseTrainingsResult => {
  const [filters, setFilters] = useState<TrainingFilters>({});
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const trainings = useMemo(() => {
    const data = hrService.getTrainings(filters.status);
    return data.sort((a, b) => a.date.localeCompare(b.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, version]);

  const selectedTraining = useMemo(
    () => (selectedTrainingId ? hrService.getTrainingById(selectedTrainingId) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTrainingId, version],
  );

  const update = () => setVersion((prev) => prev + 1);

  return {
    trainings,
    selectedTraining,
    filters,
    setFilters,
    selectTraining: setSelectedTrainingId,
    register: (trainingId, employeeId) => {
      hrService.registerForTraining(trainingId, employeeId);
      update();
    },
    markAttendance: (trainingId, employeeId, attended) => {
      hrService.recordTrainingAttendance(trainingId, employeeId, attended);
      update();
    },
    submitFeedback: (trainingId, employeeId, rating, comments) => {
      hrService.submitTrainingFeedback(trainingId, { employeeId, rating, comments });
      update();
    },
  };
};
