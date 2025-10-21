import { Outlet } from 'react-router-dom';

import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { Sidebar } from '../components/navigation/Sidebar';
import { Topbar } from '../components/navigation/Topbar';

export const DashboardLayout = () => (
  <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div className="w-full max-w-xs border-slate-800 lg:max-w-xs">
      <Sidebar />
    </div>
    <div className="flex flex-1 flex-col">
      <Topbar />
      <main className="flex-1 space-y-6 p-6">
        <Breadcrumbs />
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);
