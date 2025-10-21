import { Link, useLocation } from 'react-router-dom';

const segmentLabels: Record<string, string> = {
  dashboard: 'Дашборд',
  crm: 'CRM',
  communications: 'Комунікації',
  hr: 'HR',
  accounting: 'Бухгалтерія',
  ai: 'AI Аналітика',
  profile: 'Профіль'
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/dashboard" className="text-slate-200 hover:text-primary">
            Головна
          </Link>
        </li>
        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join('/')}`;
          const label = segmentLabels[segment] ?? segment;
          return (
            <li key={path} className="flex items-center gap-2">
              <span className="text-slate-600">/</span>
              {index === segments.length - 1 ? (
                <span className="text-primary">{label}</span>
              ) : (
                <Link to={path} className="text-slate-200 hover:text-primary">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
