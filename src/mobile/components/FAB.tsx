import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

export interface FabAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export interface FABProps {
  actions: FabAction[];
}

export const FAB = ({ actions }: FABProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.ul
            className="mb-4 flex flex-col items-end gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {actions.map((action) => (
              <motion.li
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    action.onClick();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 shadow-lg"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-xl transition active:scale-95"
        aria-label="Quick actions"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }}>
          <Plus className="h-7 w-7" />
        </motion.span>
      </button>
    </div>
  );
};
