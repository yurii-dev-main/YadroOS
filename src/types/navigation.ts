import { Role } from './auth';

export interface NavItem {
  label: string;
  icon: string;
  to: string;
  roles: Role[];
  children?: NavItem[];
}
