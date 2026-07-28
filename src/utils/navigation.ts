import type { NavItem } from '../types/navigation';

export const navItems: NavItem[] = [
  {
    label: 'Overview',
    icon: 'LayoutDashboard',
    to: '/dashboard',
    roles: ['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT', 'HR_SPECIALIST', 'VIEWER']
  },
  {
    label: 'CRM',
    icon: 'Users',
    to: '/dashboard/crm',
    roles: ['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']
  },
  {
    label: 'Communications',
    icon: 'MessageSquare',
    to: '/dashboard/communications',
    roles: ['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']
  },
  {
    label: 'HR',
    icon: 'UserSquare2',
    to: '/dashboard/hr',
    roles: ['OWNER', 'ADMIN', 'HR_SPECIALIST', 'VIEWER']
  },
  {
    label: 'Accounting',
    icon: 'Receipt',
    to: '/dashboard/accounting',
    roles: ['OWNER', 'ADMIN', 'ACCOUNTANT', 'VIEWER']
  },
  {
    label: 'Integrations',
    icon: 'Link',
    to: '/dashboard/integrations',
    roles: ['OWNER', 'ADMIN', 'MANAGER']
  },
  {
    label: 'AI Analytics',
    icon: 'Brain',
    to: '/dashboard/ai',
    roles: ['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT', 'HR_SPECIALIST', 'VIEWER']
  },
  {
    label: 'Profile',
    icon: 'UserCircle',
    to: '/profile',
    roles: ['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT', 'HR_SPECIALIST', 'VIEWER']
  }
];
