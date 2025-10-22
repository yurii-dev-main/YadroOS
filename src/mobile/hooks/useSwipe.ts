import { useSwipeable, type SwipeableHandlers } from 'react-swipeable';

export interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  delta?: number;
}

export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  delta = 20
}: UseSwipeOptions): SwipeableHandlers =>
  useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    onSwipedUp: () => onSwipeUp?.(),
    onSwipedDown: () => onSwipeDown?.(),
    preventScrollOnSwipe: true,
    trackTouch: true,
    delta
  });
