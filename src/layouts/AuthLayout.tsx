import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-50">YadroOS</h1>
        <p className="text-sm text-slate-400">Платформа децентралізованого управління</p>
      </div>
      <Outlet />
    </div>
  </div>
);
