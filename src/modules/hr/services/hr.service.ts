import {
  AttendanceRecord,
  AttendanceSummary,
  Department,
  Employee,
  EmployeeStatus,
  HRStatistics,
  KPI,
  OKR,
  OffboardingChecklist,
  OnboardingPlan,
  OrgChartNode,
  PerformanceHighlight,
  PerformanceReview,
  Training,
  TrainingFeedback,
  TrainingParticipant
} from '../types/hr.types';
import { apiClient } from '../../../services/apiClient';

interface EmployeeFilters {
  department?: string;
  position?: string;
  status?: EmployeeStatus;
  search?: string;
}

type EmployeeApiResponse = {
  id: string;
  userId?: string | null;
  firstName: string;
  lastName: string;
  position?: string | null;
  department?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    email?: string | null;
  } | null;
};

const mapEmployeeFromApi = (employee: EmployeeApiResponse): Employee => ({
  id: employee.id,
  name: `${employee.firstName} ${employee.lastName}`.trim(),
  email: employee.user?.email ?? '',
  phone: employee.phone ?? '',
  birthdate: new Date().toISOString(),
  position: employee.position ?? '—',
  department: employee.department ?? '—',
  managerId: undefined,
  hireDate: employee.hireDate ?? new Date().toISOString(),
  probationEnd: '',
  contractEnd: '',
  salary: employee.salary ?? 0,
  currency: 'USD',
  paymentMethod: 'bank_transfer',
  documents: {
    passport: '',
    taxId: '',
    bankDetails: ''
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  status: 'active',
  timeline: [],
  trainings: []
});

let mockTrainings: Training[] | null = null;

export const hrService = {
  async fetchEmployees(filters: EmployeeFilters = {}): Promise<Employee[]> {
    const response = await apiClient.get<any>('/v1/hr/employees', {
      params: filters
    });
    const data = response.data?.data || response.data || [];
    return data.map(mapEmployeeFromApi);
  },

  async fetchEmployeeById(id: string): Promise<Employee | null> {
    const response = await apiClient.get<EmployeeApiResponse>(`/v1/hr/employees/${id}`);
    return mapEmployeeFromApi(response.data);
  },

  async createEmployee(payload: Partial<EmployeeApiResponse>): Promise<Employee> {
    const response = await apiClient.post<EmployeeApiResponse>('/v1/hr/employees', payload);
    return mapEmployeeFromApi(response.data);
  },

  async updateEmployee(id: string, payload: Partial<EmployeeApiResponse>): Promise<Employee> {
    const response = await apiClient.put<EmployeeApiResponse>(`/v1/hr/employees/${id}`, payload);
    return mapEmployeeFromApi(response.data);
  },

  async deleteEmployee(id: string): Promise<void> {
    await apiClient.delete(`/v1/hr/employees/${id}`);
  },

  async getEmployees(filters: EmployeeFilters = {}): Promise<Employee[]> {
    return this.fetchEmployees(filters);
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    return this.fetchEmployeeById(id);
  },

  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<Department[]>('/v1/hr/departments');
    return response.data;
  },

  async getOrgChart(): Promise<OrgChartNode> {
    const response = await apiClient.get<any>('/v1/hr/org-chart');
    if (response.data && !Array.isArray(response.data) && response.data.children) {
      return response.data;
    }
    return { id: 'ceo', name: 'No Data', title: 'CEO' };
  },

  async getTrainings(status?: Training['status']): Promise<Training[]> {
    const response = await apiClient.get<any>('/v1/hr/trainings', {
      params: { status }
    });
    return response.data?.data || response.data || [];
  },

  async createTraining(training: Partial<Training>): Promise<Training> {
    const response = await apiClient.post<Training>('/v1/hr/trainings', training);
    return response.data;
  },

  async getTrainingById(id: string): Promise<Training> {
    const response = await apiClient.get<Training>(`/v1/hr/trainings/${id}`);
    return response.data;
  },

  async registerForTraining(trainingId: string, employeeId: string): Promise<TrainingParticipant> {
    const response = await apiClient.post<TrainingParticipant>(`/v1/hr/trainings/${trainingId}/register`, { employeeId });
    return response.data;
  },

  async recordTrainingAttendance(
    trainingId: string,
    employeeId: string,
    attended: boolean
  ): Promise<Training> {
    const response = await apiClient.post<Training>(`/v1/hr/trainings/${trainingId}/attendance`, { employeeId, attended });
    return response.data;
  },

  async submitTrainingFeedback(trainingId: string, feedback: TrainingFeedback): Promise<Training> {
    const response = await apiClient.post<Training>(`/v1/hr/trainings/${trainingId}/feedback`, feedback);
    return response.data;
  },

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    const response = await apiClient.get<any>('/v1/hr/attendance-records');
    const data = response.data?.data || response.data || [];
    
    // Group flat Prisma attendance records by employeeId to match frontend interface
    if (data.length > 0 && !data[0].entries) {
      const grouped = data.reduce((acc: any, record: any) => {
        if (!acc[record.employeeId]) {
          acc[record.employeeId] = {
            employeeId: record.employeeId,
            schedule: 'flexible',
            entries: []
          };
        }
        acc[record.employeeId].entries.push({
          date: record.date,
          checkIn: record.checkIn || '09:00',
          checkOut: record.checkOut || '17:00',
          overtimeHours: record.overtimeHours || 0,
          lunchBreakMinutes: record.lunchBreakMinutes || 60,
          location: record.location || 'Office'
        });
        return acc;
      }, {});
      return Object.values(grouped);
    }
    return data;
  },

  async getLeaveRequests(): Promise<any[]> {
    const response = await apiClient.get<any>('/v1/hr/leave-requests');
    return response.data?.data || response.data || [];
  },

  async getLeaveBalances(): Promise<any[]> {
    const response = await apiClient.get<any>('/v1/hr/leave-balances');
    return response.data?.data || response.data || [];
  },

  async getAttendanceSummaries(): Promise<AttendanceSummary[]> {
    const response = await apiClient.get<any>('/v1/hr/attendance-summaries');
    return response.data?.data || response.data || [];
  },

  async getKpis(): Promise<KPI[]> {
    const response = await apiClient.get<any>('/v1/hr/kpis');
    const data = response.data?.data || response.data || [];
    return data.map((kpi: any) => ({
      ...kpi,
      title: kpi.title || kpi.name || 'Unnamed KPI',
      role: kpi.role || 'General'
    }));
  },

  async getOkrs(): Promise<OKR[]> {
    const response = await apiClient.get<any>('/v1/hr/okrs');
    const data = response.data?.data || response.data || [];
    return data.map((okr: any) => ({
      ...okr,
      keyResults: okr.keyResults || [
        { id: 'kr1', description: 'Primary Deliverable', progress: okr.progress || 0 }
      ]
    }));
  },

  async getPerformanceReviews(): Promise<PerformanceReview[]> {
    const response = await apiClient.get<any>('/v1/hr/performance-reviews');
    const data = response.data?.data || response.data || [];
    return data.map((review: any) => ({
      ...review,
      period: review.period || 'Current Quarter',
      type: review.type || 'quarterly',
      overallScore: review.overallScore || review.rating || 0,
      feedback360: review.feedback360 || [],
      selfAssessment: review.selfAssessment || '',
      managerAssessment: review.managerAssessment || review.comments || '',
      goalsNextPeriod: review.goalsNextPeriod || []
    }));
  },

  async getPerformanceHighlights(): Promise<PerformanceHighlight[]> {
    const response = await apiClient.get<any>('/v1/hr/performance-highlights');
    return response.data?.data || response.data || [];
  },

  async getOnboardingPlans(): Promise<OnboardingPlan[]> {
    const response = await apiClient.get<any>('/v1/hr/onboarding-plans');
    return response.data?.data || response.data || [];
  },

  async getOffboardingChecklists(): Promise<OffboardingChecklist[]> {
    const response = await apiClient.get<any>('/v1/hr/offboarding-checklists');
    return response.data?.data || response.data || [];
  },

  async getStatistics(): Promise<HRStatistics> {
    const response = await apiClient.get<HRStatistics>('/v1/hr/statistics');
    return response.data;
  }
};
