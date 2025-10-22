import { createContext, useContext } from 'react';

import { usePWA } from '../hooks/usePWA';

type PWAContextValue = ReturnType<typeof usePWA>;

const Context = createContext<PWAContextValue>({
  updateAvailable: false,
  refreshApp: () => {}
});

export interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider = ({ children }: PWAProviderProps) => {
  const value = usePWA();

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const usePWAContext = () => useContext(Context);
