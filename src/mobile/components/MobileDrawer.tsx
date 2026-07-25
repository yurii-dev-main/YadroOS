import { LayoutDashboard, Menu, MessageSquare, Receipt, UserCircle, UserSquare2, Users, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

import type { NavItem } from '../../types/navigation';
import { cn } from '../../utils/cn';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  MessageSquare,
  UserSquare2,
  Receipt,
  Menu,
  UserCircle
};

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
}

export const MobileDrawer = ({ isOpen, onClose, items }: MobileDrawerProps) => {
  const location = useLocation();

  const handlers = useSwipeable({
    onSwipedLeft: () => onClose(),
    delta: 20,
    trackTouch: true,
    preventScrollOnSwipe: true
  });

  const menuItems = useMemo(() => items, [items]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-slate-800 bg-slate-950"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            {...handlers}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <span className="text-lg font-semibold">YadroOS</span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-4 py-6" aria-label="Mobile navigation">
              {menuItems.map((item) => {
                const Icon = iconMap[item.icon] ?? LayoutDashboard;
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                      isActive ? 'bg-primary/10 text-primary' : 'text-slate-200 hover:bg-slate-900'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
