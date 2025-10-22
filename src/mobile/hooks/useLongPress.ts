import { useEffect } from 'react';
import type { RefObject } from 'react';
import Hammer from 'hammerjs';

export const useLongPress = <T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
  time = 500
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const hammer = new Hammer(element);
    hammer.get('press').set({ time });
    hammer.on('press', handler);

    return () => {
      hammer.off('press', handler);
      hammer.destroy();
    };
  }, [ref, handler, time]);
};
