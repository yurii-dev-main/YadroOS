import { Navigate, NavLink, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Users, Kanban, BarChart3 } from 'lucide-react';

import { usePermissions } from '../../hooks/usePermissions';
import { AnalyticsPage, ClientDetailPage, ClientsPage, PipelinePage } from '../../modules/crm';
import { CRMErrorBoundary } from '../../modules/crm/components/CRMErrorBoundary';

const navItems = [
  { to: 'clients', label: 'Клієнти', icon: Users },
  { to: 'pipeline', label: 'Воронка', icon: Kanban },
  { to: 'analytics', label: 'Аналітика', icon: BarChart3 }
];

export const CRMPage = () => {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  if (!can('crm:read')) {
    return <p className="text-sm text-danger">Недостатньо прав для перегляду CRM.</p>;
  }

  const handleOpenClient = (id: string) => navigate(`/dashboard/crm/clients/${id}`);

  return (
    <CRMErrorBoundary>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">CRM модуль</h1>
            <p className="text-sm text-slate-400">Керуйте клієнтами, угодами та продажами в одному просторі.</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: match }) =>
                  `flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                    match || isActive
                      ? 'border-blue-500/60 bg-blue-600 text-white shadow shadow-blue-500/30'
                      : 'border-slate-700/60 bg-slate-900/60 text-slate-300 hover:border-blue-500/40 hover:text-blue-200'
                  }`
                }
              >
                <Icon className="h-4 w-4" /> {item.label}
              </NavLink>
            );
          })}
        </nav>

        <Routes>
          <Route path="" element={<Navigate to="clients" replace />} />
          <Route path="clients" element={<ClientsPage onOpenClient={handleOpenClient} />} />
          <Route path="clients/:clientId" element={<ClientDetailPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="clients" replace />} />
        </Routes>
      </div>
    </CRMErrorBoundary>
  );
};
