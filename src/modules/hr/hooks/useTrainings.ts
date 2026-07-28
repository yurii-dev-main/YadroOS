import { useState, useEffect } from 'react';
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
  submitFeedback: (
    trainingId: string,
    employeeId: string,
    rating: number,
    comments: string
  ) => void;
  addTraining: (training: Partial<Training>) => void;
}

export const useTrainings = (): UseTrainingsResult => {
  const [filters, setFilters] = useState<TrainingFilters>({});
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<Training | undefined>(undefined);

  useEffect(() => {
    hrService.getTrainings(filters.status).then(data => {
      setTrainings(data.sort((a, b) => a.date.localeCompare(b.date)));
    }).catch(console.error);
  }, [filters.status, version]);

  useEffect(() => {
    if (selectedTrainingId) {
      hrService.getTrainingById(selectedTrainingId).then(setSelectedTraining).catch(console.error);
    } else {
      setSelectedTraining(undefined);
    }
  }, [selectedTrainingId, version]);

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
    addTraining: (training) => {
      hrService.createTraining(training).then(() => {
        update();
      }).catch(console.error);
    }
  };
};
