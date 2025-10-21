import { HRDashboard } from '../../modules/hr';
import { usePermissions } from '../../hooks/usePermissions';

export const HRPage = () => {
  const { can } = usePermissions();
  if (!can('hr:read')) {
    return <p className="text-sm text-danger">Недостатньо прав для перегляду HR модуля.</p>;
  }
  return <HRDashboard />;
};
