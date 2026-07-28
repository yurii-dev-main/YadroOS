import {
  Brain,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Receipt,
  UserCircle,
  Users,
  UserSquare2,
  Link as LinkIcon
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types/auth';
import type { NavItem } from '../../types/navigation';
import { navItems } from '../../utils/navigation';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n/useTranslation';
import { OrganizationSwitcher } from './OrganizationSwitcher';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  MessageSquare,
  UserSquare2,
  Receipt,
  Brain,
  UserCircle,
  Link: LinkIcon
};

const filterNavItemsByRole = (items: NavItem[], role: Role | undefined) =>
  items.filter((item) => !role || item.roles.includes(role));

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const role = useAuthStore((state) => state.user?.role);
  const location = useLocation();
  const { t } = useTranslation();

  const items = useMemo(() => filterNavItemsByRole(navItems, role), [role]);

  return (
    <aside className="border-r border-slate-800 bg-slate-950/70">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 lg:hidden">
        <span className="text-lg font-semibold">YadroOS</span>
        <button
          type="button"
          className="rounded-md border border-slate-700 p-2"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
        </button>
      </div>
      <div className={cn('px-4 py-4 border-b border-slate-800', !isOpen && 'hidden lg:block')}>
        <OrganizationSwitcher />
      </div>
      <nav
        className={cn('space-y-1 px-4 py-4', !isOpen && 'hidden lg:block')}
        aria-label="Main navigation"
      >
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard;
          const isActive = location.pathname.startsWith(item.to);
          
          // Map to translation keys
          let tKey = 'nav.' + item.label.toLowerCase().replace(' ', '');
          if (item.label === 'AI Analytics') tKey = 'nav.ai';
          if (item.label === 'Profile') tKey = 'profile.settings';

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-slate-50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{t(tKey, item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
