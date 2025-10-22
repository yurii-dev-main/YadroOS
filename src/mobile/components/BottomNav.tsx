import { Home, MessageSquare, MoreHorizontal, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '../../utils/cn';

const items = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/dashboard/crm', label: 'CRM', icon: Users },
  { to: '/dashboard/communications', label: 'Messages', icon: MessageSquare },
  { to: '/profile', label: 'More', icon: MoreHorizontal }
];

export interface BottomNavProps {
  notifications?: number;
}

export const BottomNav = ({ notifications = 0 }: BottomNavProps) => (
  <nav
    className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-slate-800 bg-slate-950/95 pb-safe pt-2"
    aria-label="Mobile navigation"
  >
    {items.map((item) => {
      const Icon = item.icon;
      const showBadge = item.label === 'Messages' && notifications > 0;
      return (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-100'
            )
          }
        >
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-slate-100">
            <Icon className="h-5 w-5" />
            {showBadge && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </span>
          <span>{item.label}</span>
        </NavLink>
      );
    })}
  </nav>
);
