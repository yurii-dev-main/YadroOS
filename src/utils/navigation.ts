import type { NavItem } from '../types/navigation';

export const navItems: NavItem[] = [
  { label: 'Overview', icon: 'LayoutDashboard', to: '/dashboard', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT', 'HR_SPECIALIST', 'VIEWER'] },
  { label: 'CRM', icon: 'Users', to: '/dashboard/crm', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'] },
  {
    label: 'Communications',
    icon: 'MessageSquare',
    to: '/dashboard/communications',
    roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']
  },
  { label: 'HR', icon: 'UserSquare2', to: '/dashboard/hr', roles: ['ADMIN', 'HR_SPECIALIST', 'VIEWER'] },
  {
    label: 'Accounting',
    icon: 'Receipt',
    to: '/dashboard/accounting',
    roles: ['ADMIN', 'ACCOUNTANT', 'VIEWER']
  },
  { label: 'AI Analytics', icon: 'Brain', to: '/dashboard/ai', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT', 'HR_SPECIALIST', 'VIEWER'] },
  { label: 'Profile', icon: 'UserCircle', to: '/profile', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT', 'HR_SPECIALIST', 'VIEWER'] }
];
