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
  TrainingParticipant,
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

const employees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Anna Koval',
    email: 'anna.koval@example.com',
    phone: '+380991112233',
    birthdate: '1990-04-12',
    position: 'HR Director',
    department: 'HR',
    managerId: undefined,
    hireDate: '2018-02-01',
    probationEnd: '2018-05-01',
    contractEnd: '',
    salary: 4200,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    documents: {
      passport: 'KV123456',
      taxId: '1234567890',
      bankDetails: 'UA123456789012345678901234567',
    },
    emergencyContact: {
      name: 'Oleg Koval',
      relationship: 'Husband',
      phone: '+380671234567',
    },
    status: 'active',
    timeline: [
      {
        id: 'evt-1',
        date: '2018-02-01',
        type: 'hiring',
        title: 'Start of Employment',
        description: 'Joined as HR Director',
      },
      {
        id: 'evt-2',
        date: '2022-01-15',
        type: 'milestone',
        title: 'HRIS Launch',
        description: 'Successfully implemented new HR system',
      },
    ],
    trainings: ['train-1', 'train-3'],
  },
  {
    id: 'emp-2',
    name: 'Ivan Petrenko',
    email: 'ivan.petrenko@example.com',
    phone: '+380931234567',
    birthdate: '1994-11-02',
    position: 'Frontend Engineer',
    department: 'Engineering',
    managerId: 'emp-4',
    hireDate: '2020-07-10',
    probationEnd: '2020-10-10',
    contractEnd: '',
    salary: 2700,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    documents: {
      passport: 'KK987654',
      taxId: '1098765432',
      bankDetails: 'UA987654321098765432109876543',
    },
    emergencyContact: {
      name: 'Maria Petrenko',
      relationship: 'Wife',
      phone: '+380501234567',
    },
    status: 'active',
    timeline: [
      {
        id: 'evt-3',
        date: '2021-02-20',
        type: 'review',
        title: 'Annual Review',
        description: 'Score 4.7/5, promotion recommended',
      },
      {
        id: 'evt-4',
        date: '2022-09-12',
        type: 'training',
        title: 'React Advanced',
        description: 'Completed training on React 18',
      },
    ],
    trainings: ['train-2'],
  },
  {
    id: 'emp-3',
    name: 'Oleksandra Doroshenko',
    email: 'oleksandra.d@example.com',
    phone: '+380661112233',
    birthdate: '1988-08-28',
    position: 'Finance Manager',
    department: 'Finance',
    managerId: 'emp-1',
    hireDate: '2019-05-15',
    probationEnd: '2019-08-15',
    contractEnd: '',
    salary: 3500,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    documents: {
      passport: 'VS112233',
      taxId: '2233445566',
      bankDetails: 'UA223344556677889900112233445',
    },
    emergencyContact: {
      name: 'Dmytro Doroshenko',
      relationship: 'Husband',
      phone: '+380731234567',
    },
    status: 'on_leave',
    timeline: [
      {
        id: 'evt-5',
        date: '2023-03-01',
        type: 'leave',
        title: 'Maternity Leave',
        description: 'Paid leave ongoing',
      },
    ],
    trainings: ['train-3'],
  },
  {
    id: 'emp-4',
    name: 'Mykhailo Bondar',
    email: 'mykhailo.bondar@example.com',
    phone: '+380671234890',
    birthdate: '1985-01-19',
    position: 'Engineering Manager',
    department: 'Engineering',
    managerId: 'emp-1',
    hireDate: '2017-09-01',
    probationEnd: '2017-12-01',
    contractEnd: '',
    salary: 4800,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    documents: {
      passport: 'AN334455',
      taxId: '3344556677',
      bankDetails: 'UA556677889900112233445566778',
    },
    emergencyContact: {
      name: 'Iryna Bondar',
      relationship: 'Wife',
      phone: '+380991234890',
    },
    status: 'active',
    timeline: [
      {
        id: 'evt-6',
        date: '2019-01-01',
        type: 'promotion',
        title: 'Promotion to Engineering Manager',
        description: 'Led the frontend team',
      },
    ],
    trainings: ['train-2', 'train-4'],
  },
];

const departments: Department[] = [
  {
    id: 'dep-hr',
    name: 'HR',
    managerId: 'emp-1',
    members: ['emp-1'],
    stats: {
      headcount: 2,
      openPositions: 1,
      averageTenure: 4.5,
    },
  },
  {
    id: 'dep-eng',
    name: 'Engineering',
    managerId: 'emp-4',
    members: ['emp-2', 'emp-4'],
    stats: {
      headcount: 25,
      openPositions: 3,
      averageTenure: 3.2,
    },
  },
  {
    id: 'dep-fin',
    name: 'Finance',
    managerId: 'emp-3',
    members: ['emp-3'],
    stats: {
      headcount: 6,
      openPositions: 0,
      averageTenure: 5.1,
    },
  },
];

const orgChart: OrgChartNode = {
  id: 'emp-1',
  name: 'Anna Koval',
  title: 'CEO',
  children: [
    {
      id: 'emp-4',
      name: 'Mykhailo Bondar',
      title: 'Engineering Manager',
      children: [
        {
          id: 'emp-2',
          name: 'Ivan Petrenko',
          title: 'Frontend Engineer',
        },
      ],
    },
    {
      id: 'emp-3',
      name: 'Oleksandra Doroshenko',
      title: 'Finance Manager',
    },
  ],
};

const trainings: Training[] = [
  {
    id: 'train-1',
    title: 'Onboarding Bootcamp',
    description: 'Adaptation program for new employees',
    type: 'workshop',
    instructor: 'Anna Koval',
    date: '2024-03-15T09:00:00Z',
    duration: 4,
    location: 'Conference Room A',
    capacity: 20,
    materials: [
      { id: 'mat-1', title: 'Welcome Guide', url: '/docs/welcome.pdf' },
      { id: 'mat-2', title: 'HR Policies', url: '/docs/hr-policies.pdf' },
    ],
    status: 'scheduled',
    participants: [
      { employeeId: 'emp-2', attended: false, feedbackSubmitted: false },
      { employeeId: 'emp-3', attended: false, feedbackSubmitted: false },
    ],
    feedback: [],
    isMandatory: true,
  },
  {
    id: 'train-2',
    title: 'React 18 Advanced',
    description: 'Advanced course on modern React features',
    type: 'course',
    instructor: 'Mykhailo Bondar',
    date: '2024-02-28T10:00:00Z',
    duration: 6,
    location: 'Zoom',
    capacity: 30,
    materials: [
      { id: 'mat-3', title: 'React Hooks Overview', url: '/docs/hooks.pdf' },
      { id: 'mat-4', title: 'Concurrent Rendering', url: '/docs/concurrent.pdf' },
    ],
    status: 'ongoing',
    participants: [
      { employeeId: 'emp-2', attended: true, feedbackSubmitted: true },
      { employeeId: 'emp-4', attended: true, feedbackSubmitted: false },
    ],
    feedback: [
      { employeeId: 'emp-2', rating: 5, comments: 'Very useful and practical course' },
    ],
  },
  {
    id: 'train-3',
    title: 'Finance Compliance',
    description: 'Mandatory course for all finance managers',
    type: 'webinar',
    instructor: 'Oleksandra Doroshenko',
    date: '2024-04-05T12:00:00Z',
    duration: 2,
    location: 'Teams',
    capacity: 15,
    materials: [{ id: 'mat-5', title: 'Compliance Checklist', url: '/docs/compliance.pdf' }],
    status: 'scheduled',
    participants: [{ employeeId: 'emp-1', attended: false, feedbackSubmitted: false }],
    feedback: [],
    isMandatory: true,
  },
  {
    id: 'train-4',
    title: 'Leadership Essentials',
    description: 'Development of leadership qualities and coaching',
    type: 'workshop',
    instructor: 'Guest Trainer',
    date: '2024-01-20T09:30:00Z',
    duration: 5,
    location: 'Conference Room B',
    capacity: 25,
    materials: [{ id: 'mat-6', title: 'Leadership Toolkit', url: '/docs/leadership.pdf' }],
    status: 'completed',
    participants: [
      { employeeId: 'emp-1', attended: true, feedbackSubmitted: true },
      { employeeId: 'emp-4', attended: true, feedbackSubmitted: true },
    ],
    feedback: [
      { employeeId: 'emp-1', rating: 4, comments: 'Great practical case studies' },
      { employeeId: 'emp-4', rating: 5, comments: 'Inspiring training' },
    ],
  },
];

const attendanceRecords: AttendanceRecord[] = [
  {
    employeeId: 'emp-2',
    schedule: 'flexible',
    entries: [
      {
        date: '2024-02-19',
        checkIn: '09:10',
        checkOut: '18:05',
        location: 'Kyiv Hub',
        overtimeHours: 1,
        lunchBreakMinutes: 45,
      },
      {
        date: '2024-02-20',
        checkIn: '09:05',
        checkOut: '17:45',
        location: 'Remote',
        overtimeHours: 0,
        lunchBreakMinutes: 60,
      },
    ],
  },
  {
    employeeId: 'emp-4',
    schedule: 'fixed',
    entries: [
      {
        date: '2024-02-19',
        checkIn: '08:55',
        checkOut: '18:15',
        location: 'Kyiv HQ',
        overtimeHours: 1.5,
        lunchBreakMinutes: 30,
      },
    ],
  },
];

const leaveRequests = [
  {
    id: 'leave-1',
    employeeId: 'emp-2',
    type: 'vacation' as const,
    startDate: '2024-03-04',
    endDate: '2024-03-08',
    status: 'approved' as const,
    approverId: 'emp-4',
    history: [
      { date: '2024-02-10', action: 'submitted', actorId: 'emp-2' },
      { date: '2024-02-12', action: 'approved', actorId: 'emp-4' },
    ],
  },
  {
    id: 'leave-2',
    employeeId: 'emp-3',
    type: 'personal' as const,
    startDate: '2024-02-01',
    endDate: '2024-06-01',
    status: 'approved' as const,
    approverId: 'emp-1',
    history: [
      { date: '2024-01-15', action: 'submitted', actorId: 'emp-3' },
      { date: '2024-01-16', action: 'approved', actorId: 'emp-1' },
    ],
  },
];

const leaveBalances = [
  { employeeId: 'emp-2', type: 'vacation' as const, total: 24, used: 10 },
  { employeeId: 'emp-2', type: 'sick_leave' as const, total: 10, used: 2 },
  { employeeId: 'emp-4', type: 'vacation' as const, total: 24, used: 6 },
];

const attendanceSummaries: AttendanceSummary[] = [
  { employeeId: 'emp-2', attendanceRate: 96, lateArrivals: 2, absenteeismRate: 1 },
  { employeeId: 'emp-4', attendanceRate: 98, lateArrivals: 1, absenteeismRate: 0.5 },
];

const kpis: KPI[] = [
  { id: 'kpi-1', role: 'Engineering Manager', title: 'Delivery Rate', target: 95, current: 92, unit: '%' },
  { id: 'kpi-2', role: 'Frontend Engineer', title: 'Bug-Free Deploys', target: 98, current: 96, unit: '%' },
  { id: 'kpi-3', role: 'HR Director', title: 'Retention Rate', target: 90, current: 88, unit: '%' },
];

const okrs: OKR[] = [
  {
    id: 'okr-1',
    objective: 'Improve onboarding time for new hires',
    keyResults: [
      { id: 'kr-1', description: 'Reduce onboarding time to 14 days', progress: 70 },
      { id: 'kr-2', description: 'Launch 3 new training courses', progress: 40 },
    ],
  },
  {
    id: 'okr-2',
    objective: 'Improve release quality',
    keyResults: [
      { id: 'kr-3', description: 'Reduce critical bugs by 30%', progress: 55 },
      { id: 'kr-4', description: 'Implement automated testing', progress: 80 },
    ],
  },
];

const performanceReviews: PerformanceReview[] = [
  {
    id: 'rev-1',
    employeeId: 'emp-2',
    period: '2023 Q4',
    type: 'quarterly',
    overallScore: 4.6,
    feedback360: ['Excellent team player', 'Needs more attention to documentation'],
    selfAssessment: 'Achieved all set OKRs',
    managerAssessment: 'Strong technical leader, continues to grow',
    goalsNextPeriod: ['Participate in mentoring program', 'Improve architecture skills'],
  },
  {
    id: 'rev-2',
    employeeId: 'emp-4',
    period: '2023 Annual',
    type: 'annual',
    overallScore: 4.8,
    feedback360: ['Inspiration for the team', 'Excellent communicator'],
    selfAssessment: 'Expanded the team by 30%',
    managerAssessment: 'Exceeded expectations across all KPIs',
    goalsNextPeriod: ['Launch coaching program', 'Improve collaboration with QA'],
  },
];

const performanceHighlights: PerformanceHighlight[] = [
  { employeeId: 'emp-4', title: 'Top Performer', score: 4.8 },
  { employeeId: 'emp-2', title: 'Employee of the Month', score: 4.7 },
];

const onboardingPlans: OnboardingPlan[] = [
  {
    employeeId: 'emp-2',
    buddyId: 'emp-4',
    startDate: '2020-07-10',
    tasks: [
      { id: 'on-1', title: 'Welcome email', completed: true, dueDate: '2020-07-09', owner: 'HR' },
      { id: 'on-2', title: 'Equipment issued', completed: true, dueDate: '2020-07-10', owner: 'IT' },
      { id: 'on-3', title: 'Security training', completed: true, dueDate: '2020-07-15', owner: 'Security' },
    ],
  },
];

const offboardingChecklists: OffboardingChecklist[] = [
  {
    employeeId: 'emp-5',
    exitInterviewScheduled: true,
    finalPaycheckProcessed: false,
    tasks: [
      { id: 'off-1', title: 'Laptop return', completed: false, owner: 'IT' },
      { id: 'off-2', title: 'Revoke access', completed: false, owner: 'Security' },
      { id: 'off-3', title: 'Final settlement', completed: false, owner: 'Finance' },
    ],
  },
];

const hrStatistics: HRStatistics = {
  totalEmployees: employees.length,
  activeTrainings: trainings.filter((training) => training.status !== 'completed' && training.status !== 'cancelled').length,
  attendanceRate: attendanceSummaries.reduce((acc, item) => acc + item.attendanceRate, 0) / attendanceSummaries.length,
  topPerformers: performanceHighlights,
};

const clone = <T,>(data: T): T =>
  data === undefined ? data : (JSON.parse(JSON.stringify(data)) as T);

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
    bankDetails: '',
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
  },
  status: 'active',
  timeline: [],
  trainings: [],
});

export const hrService = {
  async fetchEmployees(filters: EmployeeFilters = {}): Promise<Employee[]> {
    const response = await apiClient.get<{ data: EmployeeApiResponse[] }>('/v1/hr/employees', {
      params: filters,
    });
    return response.data.data.map(mapEmployeeFromApi);
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

  getEmployees(filters: EmployeeFilters = {}): Employee[] {
    const { department, position, status, search } = filters;
    return clone(
      employees.filter((employee) => {
        const matchesDepartment = department ? employee.department === department : true;
        const matchesPosition = position ? employee.position === position : true;
        const matchesStatus = status ? employee.status === status : true;
        const matchesSearch = search
          ? employee.name.toLowerCase().includes(search.toLowerCase()) ||
            employee.email.toLowerCase().includes(search.toLowerCase())
          : true;
        return matchesDepartment && matchesPosition && matchesStatus && matchesSearch;
      }),
    );
  },

  getEmployeeById(id: string): Employee | undefined {
    return clone(employees.find((employee) => employee.id === id));
  },

  getDepartments(): Department[] {
    return clone(departments);
  },

  getOrgChart(): OrgChartNode {
    return clone(orgChart);
  },

  getTrainings(status?: Training['status']): Training[] {
    return clone(status ? trainings.filter((training) => training.status === status) : trainings);
  },

  getTrainingById(id: string): Training | undefined {
    return clone(trainings.find((training) => training.id === id));
  },

  registerForTraining(trainingId: string, employeeId: string): TrainingParticipant | undefined {
    const training = trainings.find((item) => item.id === trainingId);
    if (!training) return undefined;
    const alreadyRegistered = training.participants.find((participant) => participant.employeeId === employeeId);
    if (alreadyRegistered) {
      return clone(alreadyRegistered);
    }
    const participant: TrainingParticipant = { employeeId, attended: false, feedbackSubmitted: false };
    training.participants.push(participant);
    return clone(participant);
  },

  recordTrainingAttendance(trainingId: string, employeeId: string, attended: boolean): Training | undefined {
    const training = trainings.find((item) => item.id === trainingId);
    if (!training) return undefined;
    const participant = training.participants.find((item) => item.employeeId === employeeId);
    if (participant) {
      participant.attended = attended;
    }
    return clone(training);
  },

  submitTrainingFeedback(trainingId: string, feedback: TrainingFeedback): Training | undefined {
    const training = trainings.find((item) => item.id === trainingId);
    if (!training) return undefined;
    const existing = training.feedback.find((item) => item.employeeId === feedback.employeeId);
    if (existing) {
      existing.rating = feedback.rating;
      existing.comments = feedback.comments;
    } else {
      training.feedback.push(feedback);
    }
    return clone(training);
  },

  getAttendanceRecords(): AttendanceRecord[] {
    return clone(attendanceRecords);
  },

  getLeaveRequests() {
    return clone(leaveRequests);
  },

  getLeaveBalances() {
    return clone(leaveBalances);
  },

  getAttendanceSummaries(): AttendanceSummary[] {
    return clone(attendanceSummaries);
  },

  getKpis(): KPI[] {
    return clone(kpis);
  },

  getOkrs(): OKR[] {
    return clone(okrs);
  },

  getPerformanceReviews(): PerformanceReview[] {
    return clone(performanceReviews);
  },

  getPerformanceHighlights(): PerformanceHighlight[] {
    return clone(performanceHighlights);
  },

  getOnboardingPlans(): OnboardingPlan[] {
    return clone(onboardingPlans);
  },

  getOffboardingChecklists(): OffboardingChecklist[] {
    return clone(offboardingChecklists);
  },

  getStatistics(): HRStatistics {
    return clone(hrStatistics);
  },
};
