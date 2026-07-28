import { useEffect, useState, useRef } from 'react';
import { Building2, Check, ChevronDown, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { organizationsApi, Organization } from '../../api/organizations.api';
import { cn } from '../../utils/cn';

export const OrganizationSwitcher = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentOrganizationId = useAuthStore((state) => state.currentOrganizationId);
  const switchOrganization = useAuthStore((state) => state.switchOrganization);

  const fetchOrganizations = async () => {
    try {
      const orgs = await organizationsApi.getMyOrganizations();
      setOrganizations(orgs);
    } catch (e) {
      console.error('Failed to fetch organizations', e);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (orgId: string) => {
    try {
      await switchOrganization(orgId);
      setIsOpen(false);
    } catch (e) {
      console.error('Failed to switch organization', e);
    }
  };

  const currentOrg = organizations.find((o) => o.id === currentOrganizationId);

  if (organizations.length === 0) return null;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="truncate max-w-[120px]">{currentOrg?.name || 'Select Org'}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full origin-top rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-lg shadow-black/50 z-50">
          <div className="mb-1 px-2 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
            Organizations
          </div>
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelect(org.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors',
                org.id === currentOrganizationId
                  ? 'bg-primary/20 text-primary'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span className="truncate">{org.name}</span>
              {org.id === currentOrganizationId && <Check className="h-4 w-4" />}
            </button>
          ))}
          <div className="my-1 border-t border-slate-700" />
          <button
            onClick={() => {
              navigate('/organization/settings');
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Settings className="h-4 w-4" />
            <span>Manage Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};
