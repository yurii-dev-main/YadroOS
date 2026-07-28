export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export type PaymentMethod = 'bank_transfer' | 'cash' | 'crypto';

export interface EmployeeDocument {
  passport: string;
  taxId: string;
  bankDetails: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export type TimelineEventType =
  'hiring' | 'promotion' | 'review' | 'training' | 'leave' | 'warning' | 'milestone';

export interface EmployeeTimelineEvent {
  id: string;
  date: string;
  type: TimelineEventType;
  title: string;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  position: string;
  department: string;
  managerId?: string;
  hireDate: string;
  probationEnd?: string;
  contractEnd?: string;
  salary: number;
  currency: string;
  paymentMethod: PaymentMethod;
  documents: EmployeeDocument;
  emergencyContact: EmergencyContact;
  status: EmployeeStatus;
  timeline: EmployeeTimelineEvent[];
  trainings: string[];
  performanceScore?: number;
  timeTrackingSummary?: {
    attendanceRate: number;
    hoursWorkedLastMonth: number;
  };
}

export interface DepartmentStats {
  headcount: number;
  openPositions: number;
  averageTenure: number;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  members: string[];
  stats: DepartmentStats;
}

export interface OrgChartNode {
  id: string;
  name: string;
  title: string;
  role?: string;
  department?: string;
  avatarUrl?: string;
  children?: OrgChartNode[];
}

export type TrainingStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export type TrainingType = 'workshop' | 'webinar' | 'course';

export interface TrainingMaterial {
  id: string;
  title: string;
  url: string;
}

export interface TrainingParticipant {
  employeeId: string;
  attended: boolean;
  feedbackSubmitted: boolean;
}

export interface TrainingFeedback {
  employeeId: string;
  rating: number;
  comments: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  type: TrainingType;
  instructor: string;
  date: string;
  duration: number;
  location: string;
  capacity: number;
  materials: TrainingMaterial[];
  status: TrainingStatus;
  participants: TrainingParticipant[];
  feedback: TrainingFeedback[];
  isMandatory?: boolean;
}

export interface TimeEntry {
  date: string;
  checkIn: string;
  checkOut: string;
  location?: string;
  overtimeHours: number;
  lunchBreakMinutes: number;
}

export interface AttendanceRecord {
  employeeId: string;
  schedule: 'flexible' | 'fixed' | 'shift';
  entries: TimeEntry[];
}

export type LeaveType = 'vacation' | 'sick_leave' | 'personal';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  history: {
    date: string;
    action: string;
    actorId: string;
  }[];
}

export interface LeaveBalance {
  employeeId: string;
  type: LeaveType;
  total: number;
  used: number;
}

export interface AttendanceSummary {
  employeeId: string;
  attendanceRate: number;
  lateArrivals: number;
  absenteeismRate: number;
  date?: string;
}

export interface KPI {
  id: string;
  employeeId?: string;
  role: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface OKR {
  id: string;
  employeeId?: string;
  objective: string;
  keyResults: {
    id: string;
    description: string;
    progress: number;
  }[];
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId?: string;
  period: string;
  type: 'quarterly' | 'annual';
  overallScore: number;
  feedback360: string[];
  selfAssessment: string;
  managerAssessment: string;
  goalsNextPeriod: string[];
}

export interface PerformanceHighlight {
  employeeId: string;
  id?: string;
  title: string;
  score: number;
}

export interface OnboardingTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  owner: string;
}

export interface OnboardingPlan {
  employeeId: string;
  buddyId: string;
  startDate: string;
  tasks: OnboardingTask[];
}

export interface OffboardingTask {
  id: string;
  title: string;
  completed: boolean;
  owner: string;
}

export interface OffboardingChecklist {
  employeeId: string;
  exitInterviewScheduled: boolean;
  finalPaycheckProcessed: boolean;
  tasks: OffboardingTask[];
}

export interface HRStatistics {
  totalEmployees: number;
  activeTrainings: number;
  attendanceRate: number;
  topPerformers: PerformanceHighlight[];
}
