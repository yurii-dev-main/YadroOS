import { Bell, LogOut, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuthStore } from '../../store/authStore';

export const Topbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 bg-slate-950/60 px-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex w-full max-w-lg items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Пошук по платформі"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Пошук"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" aria-label="Переглянути сповіщення">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar fallback={user?.name ?? 'U'} src={user?.avatarUrl} alt={user?.name} />
            <div className="hidden text-left text-sm sm:block">
              <p className="font-semibold text-slate-100">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Профіль
          </Button>
          <Button variant="ghost" onClick={handleLogout} aria-label="Вийти">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
