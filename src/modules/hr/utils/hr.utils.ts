import { Employee, EmployeeStatus, TimelineEventType } from '../types/hr.types';

export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('uk-UA', { style: 'currency', currency }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));

export const getStatusLabel = (status: EmployeeStatus) => {
  switch (status) {
    case 'active':
      return 'Активний';
    case 'on_leave':
      return 'У відпустці';
    case 'terminated':
      return 'Звільнений';
    default:
      return status;
  }
};

export const getTimelineLabel = (type: TimelineEventType) => {
  switch (type) {
    case 'hiring':
      return 'Найм';
    case 'promotion':
      return 'Підвищення';
    case 'review':
      return 'Оцінювання';
    case 'training':
      return 'Тренінг';
    case 'leave':
      return 'Відпустка';
    case 'warning':
      return 'Попередження';
    case 'milestone':
      return 'Досягнення';
    default:
      return type;
  }
};

export const getEmployeeName = (employees: Employee[], id?: string) =>
  employees.find((employee) => employee.id === id)?.name ?? '—';
