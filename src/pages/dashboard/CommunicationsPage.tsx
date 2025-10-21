import { CommunicationsCenter } from '../../modules/Communications';
import { usePermissions } from '../../hooks/usePermissions';

export const CommunicationsPage = () => {
  const { can } = usePermissions();
  if (!can('communications:read')) {
    return <p className="text-sm text-danger">Недостатньо прав для перегляду комунікацій.</p>;
  }
  return <CommunicationsCenter />;
};
