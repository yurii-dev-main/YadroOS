import { AccountingWorkspace } from '../../modules/accounting';
import { usePermissions } from '../../hooks/usePermissions';

export const AccountingPage = () => {
  const { can } = usePermissions();
  if (!can('accounting:read')) {
    return <p className="text-sm text-danger">Insufficient permissions to view accounting.</p>;
  }
  return <AccountingWorkspace />;
};
