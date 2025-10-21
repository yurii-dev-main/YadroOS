import { CRMOverview } from '../../modules/CRM';
import { usePermissions } from '../../hooks/usePermissions';

export const CRMPage = () => {
  const { can } = usePermissions();
  if (!can('crm:read')) {
    return <p className="text-sm text-danger">Недостатньо прав для перегляду CRM.</p>;
  }
  return <CRMOverview />;
};
