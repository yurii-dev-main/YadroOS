import { Employee, EmployeeStatus, TimelineEventType } from '../types/hr.types';

export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('uk-UA', { style: 'currency', currency }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value));

export const getStatusLabel = (status: EmployeeStatus) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'on_leave':
      return 'On leave';
    case 'terminated':
      return 'Terminated';
    default:
      return status;
  }
};

export const getTimelineLabel = (type: TimelineEventType) => {
  switch (type) {
    case 'hiring':
      return 'Hiring';
    case 'promotion':
      return 'Promotion';
    case 'review':
      return 'Review';
    case 'training':
      return 'Training';
    case 'leave':
      return 'Leave';
    case 'warning':
      return 'Warning';
    case 'milestone':
      return 'Milestone';
    default:
      return type;
  }
};

export const getEmployeeName = (employees: Employee[], id?: string) =>
  employees.find((employee) => employee.id === id)?.name ?? '—';
