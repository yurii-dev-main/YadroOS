import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AISuitePage } from './pages/dashboard/AISuitePage';
import { AccountingPage } from './pages/dashboard/AccountingPage';
import { CommunicationsPage } from './pages/dashboard/CommunicationsPage';
import { CRMPage } from './pages/dashboard/CRMPage';
import { IntegrationsPage } from './pages/dashboard/IntegrationsPage';
import { HRPage } from './pages/dashboard/HRPage';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { OrganizationSettings } from './pages/organization/OrganizationSettings';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

const App = () => {
  const theme = useAuthStore((state) => state.user?.preferences?.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else if (theme) {
      root.classList.add(theme);
    } else {
      root.classList.add('dark'); // Default to Steel Blue (dark)
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<OverviewPage />} />
            <Route path="/dashboard/crm/*" element={<CRMPage />} />
            <Route path="/dashboard/communications" element={<CommunicationsPage />} />
            <Route path="/dashboard/hr" element={<HRPage />} />
            <Route path="/dashboard/accounting" element={<AccountingPage />} />
            <Route path="/dashboard/ai" element={<AISuitePage />} />
            <Route path="/dashboard/integrations" element={<IntegrationsPage />} />
            <Route path="/organization/settings" element={<OrganizationSettings />} />
          </Route>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
