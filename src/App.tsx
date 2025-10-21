import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AISuitePage } from './pages/dashboard/AISuitePage';
import { AccountingPage } from './pages/dashboard/AccountingPage';
import { CommunicationsPage } from './pages/dashboard/CommunicationsPage';
import { CRMPage } from './pages/dashboard/CRMPage';
import { HRPage } from './pages/dashboard/HRPage';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProfilePage } from './pages/profile/ProfilePage';

const App = () => (
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
      </Route>
      <Route path="/profile" element={<ProfilePage />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
