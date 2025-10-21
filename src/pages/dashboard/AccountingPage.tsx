import { AccountingSnapshot } from '../../modules/Accounting';
import { usePermissions } from '../../hooks/usePermissions';

export const AccountingPage = () => {
  const { can } = usePermissions();
  if (!can('accounting:read')) {
    return <p className="text-sm text-danger">Недостатньо прав для перегляду бухгалтерії.</p>;
  }
  return <AccountingSnapshot />;
};
