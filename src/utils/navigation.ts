import type { NavItem } from '../types/navigation';

export const navItems: NavItem[] = [
  { label: 'Огляд', icon: 'LayoutDashboard', to: '/dashboard', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT', 'HR_SPECIALIST', 'VIEWER'] },
  { label: 'CRM', icon: 'Users', to: '/dashboard/crm', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'] },
  {
    label: 'Комунікації',
    icon: 'MessageSquare',
    to: '/dashboard/communications',
    roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']
  },
  { label: 'HR', icon: 'UserSquare2', to: '/dashboard/hr', roles: ['ADMIN', 'HR_SPECIALIST', 'VIEWER'] },
  {
    label: 'Бухгалтерія',
    icon: 'Receipt',
    to: '/dashboard/accounting',
    roles: ['ADMIN', 'ACCOUNTANT', 'VIEWER']
  },
  { label: 'AI Аналітика', icon: 'Brain', to: '/dashboard/ai', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT', 'HR_SPECIALIST', 'VIEWER'] },
  { label: 'Профіль', icon: 'UserCircle', to: '/profile', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT', 'HR_SPECIALIST', 'VIEWER'] }
];
