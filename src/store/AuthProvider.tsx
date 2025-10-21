import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';

import { useAuthStore } from './authStore';

interface AuthContextValue {
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isLoading: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const tokens = useAuthStore((state) => state.tokens);
  const refreshTokens = useAuthStore((state) => state.refreshTokens);

  useEffect(() => {
    if (!tokens) {
      return;
    }

    const timeUntilExpiry = tokens.expiresAt - Date.now();
    if (timeUntilExpiry <= 0) {
      void refreshTokens();
      return;
    }

    const refreshDelay = Math.max(timeUntilExpiry - 60_000, 5_000);
    const timeout = window.setTimeout(() => {
      void refreshTokens();
    }, refreshDelay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [tokens, refreshTokens]);

  const value = useMemo(() => ({ isLoading: false }), []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
