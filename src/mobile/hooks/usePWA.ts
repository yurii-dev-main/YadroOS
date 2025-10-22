import { useCallback, useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

export const usePWA = () => {
  const [wb, setWb] = useState<Workbox | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const workbox = new Workbox('/service-worker.js');
      setWb(workbox);

      workbox.addEventListener('waiting', () => {
        setUpdateAvailable(true);
      });

      workbox.addEventListener('controlling', () => {
        window.location.reload();
      });

      workbox.register();
    }
  }, []);

  const refreshApp = useCallback(() => {
    if (!wb) {
      return;
    }

    wb.messageSkipWaiting();
  }, [wb]);

  return { updateAvailable, refreshApp };
};
