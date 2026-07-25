import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const BottomSheet = ({ isOpen, onClose, title, children }: BottomSheetProps) => {
  const handlers = useSwipeable({
    onSwipedDown: () => onClose(),
    preventScrollOnSwipe: true,
    trackTouch: true,
    delta: 10
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-slate-800 bg-slate-900/95 p-6"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 35 }}
            {...handlers}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-600" />
            {title && (
              <h3 className="mb-4 text-center text-base font-semibold text-slate-100">{title}</h3>
            )}
            <div className="max-h-[70vh] overflow-y-auto pr-1 text-sm text-slate-200">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
