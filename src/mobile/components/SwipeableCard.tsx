import { ReactNode, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';

import { useLongPress } from '../hooks/useLongPress';

export interface SwipeAction {
  label: string;
  color?: string;
  onTrigger: () => void;
}

export interface SwipeableCardProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onLongPress?: () => void;
}

export const SwipeableCard = ({ children, leftAction, rightAction, onLongPress }: SwipeableCardProps) => {
  const [offset, setOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      setOffset(eventData.deltaX);
    },
    onSwiped: (eventData) => {
      if (eventData.dir === 'Left' && rightAction) {
        rightAction.onTrigger();
      }
      if (eventData.dir === 'Right' && leftAction) {
        leftAction.onTrigger();
      }
      setOffset(0);
    },
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
    delta: 30
  });

  useLongPress(cardRef, () => {
    onLongPress?.();
  });

  return (
    <div className="relative">
      {rightAction && (
        <div
          className="absolute inset-y-0 right-0 flex w-24 items-center justify-center rounded-xl"
          style={{ backgroundColor: rightAction.color ?? '#ef4444' }}
        >
          <span className="text-xs font-semibold uppercase text-white">{rightAction.label}</span>
        </div>
      )}
      {leftAction && (
        <div
          className="absolute inset-y-0 left-0 flex w-24 items-center justify-center rounded-xl"
          style={{ backgroundColor: leftAction.color ?? '#3b82f6' }}
        >
          <span className="text-xs font-semibold uppercase text-white">{leftAction.label}</span>
        </div>
      )}
      <div
        {...handlers}
        ref={cardRef}
        className="relative rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-inner transition-transform active:scale-[0.99]"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
};
