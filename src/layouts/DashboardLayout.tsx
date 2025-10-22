import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { Sidebar } from '../components/navigation/Sidebar';
import { Topbar } from '../components/navigation/Topbar';
import { MobileLayout } from '../mobile/layouts/MobileLayout';
import { usePWAContext } from '../mobile/context/PWAContext';

const MOBILE_BREAKPOINT = 1024;

export const DashboardLayout = () => {
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false)
  );
  const { updateAvailable, refreshApp } = usePWAContext();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const content = (
    <>
      <Breadcrumbs />
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 shadow-lg backdrop-blur lg:p-6">
        <Outlet />
      </div>
    </>
  );

  if (isMobile) {
    return <MobileLayout updateAvailable={updateAvailable} onRefresh={refreshApp}>{content}</MobileLayout>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-xs border-slate-800 lg:max-w-xs">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 p-6">{content}</main>
      </div>
    </div>
  );
};
