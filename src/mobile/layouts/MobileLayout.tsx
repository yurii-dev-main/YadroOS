import { Bell, Camera, Menu, PlusCircle, UserPlus, Workflow } from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Avatar } from '../../components/ui/avatar';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types/auth';
import type { NavItem } from '../../types/navigation';
import { navItems } from '../../utils/navigation';
import { BottomNav } from '../components/BottomNav';
import { FAB } from '../components/FAB';
import { MobileDrawer } from '../components/MobileDrawer';
import { MobileActionsSheet } from '../components/MobileActionsSheet';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const filterNavItemsByRole = (items: NavItem[], role: Role | undefined) =>
  items.filter((item) => !role || item.roles.includes(role));

export interface MobileLayoutProps {
  children: ReactNode;
  updateAvailable?: boolean;
  onRefresh?: () => void;
}

export const MobileLayout = ({ children, updateAvailable = false, onRefresh }: MobileLayoutProps) => {
  const { isOnline } = useOnlineStatus();
  const { install, canInstall } = useInstallPrompt();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);
  const role = useAuthStore((state) => state.user?.role);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const { ready, getPendingActions } = useOfflineQueue();

  const navigation = useMemo(() => filterNavItemsByRole(navItems, role), [role]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    void getPendingActions().then((actions) => setPendingActions(actions.length));
  }, [ready, getPendingActions, isOnline]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      {!isOnline && (
        <div className="fixed inset-x-0 top-0 z-40 bg-amber-500/90 px-4 py-2 text-center text-sm font-semibold text-slate-950">
          No network connection. Offline mode.
        </div>
      )}
      {updateAvailable && onRefresh && (
        <button
          type="button"
          className="fixed inset-x-4 bottom-28 z-50 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-lg"
          onClick={onRefresh}
        >
          Update available. Click to reload.
        </button>
      )}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/80 px-4 py-3 pt-safe backdrop-blur">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 text-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-base font-semibold">YadroOS</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-700"
            aria-label="Notifications"
            onClick={() => navigate('/dashboard/communications')}
          >
            <Bell className="h-5 w-5" />
            {pendingActions > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          <Avatar
            src={user?.avatarUrl}
            alt={user?.name}
            fallback={user?.name ?? 'U'}
            className="h-11 w-11 text-base"
          />
        </div>
      </header>

      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} items={navigation} />

      <main className="pb-32 pt-4">
        <div className="px-4">
          <div className="space-y-4">
            {!isOnline && (
              <p className="rounded-xl border border-amber-400/40 bg-amber-500/20 p-4 text-xs text-amber-100">
                You are working offline. Data will synchronize once reconnected to the network.
              </p>
            )}
            {canInstall && (
              <button
                type="button"
                onClick={install}
                className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold">Install app</span>
                <PlusCircle className="h-5 w-5" />
              </button>
            )}
            {children}
          </div>
        </div>
      </main>

      <BottomNav notifications={pendingActions} />

      <FAB
        actions={[
          {
            icon: <UserPlus className="h-4 w-4" />,
            label: 'Add client',
            onClick: () => navigate('/dashboard/crm')
          },
          {
            icon: <Workflow className="h-4 w-4" />,
            label: 'New deal',
            onClick: () => navigate('/dashboard/crm')
          },
          {
            icon: <Camera className="h-4 w-4" />,
            label: 'Scan',
            onClick: () => setActionsSheetOpen(true)
          }
        ]}
      />

      <MobileActionsSheet open={actionsSheetOpen} onClose={() => setActionsSheetOpen(false)} />
    </div>
  );
};
