import { AIDashboard } from '../../modules/AI';
import { usePermissions } from '../../hooks/usePermissions';

export const AISuitePage = () => {
  const { can } = usePermissions();
  if (!can('ai:read')) {
    return <p className="text-sm text-danger">Недостатньо прав для перегляду AI аналітики.</p>;
  }
  return <AIDashboard />;
};
