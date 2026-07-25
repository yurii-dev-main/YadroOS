import { HRDashboard } from '../../modules/hr';
import { usePermissions } from '../../hooks/usePermissions';

export const HRPage = () => {
  const { can } = usePermissions();
  if (!can('hr:read')) {
    return <p className="text-sm text-danger">Insufficient permissions to view HR module.</p>;
  }
  return <HRDashboard />;
};
