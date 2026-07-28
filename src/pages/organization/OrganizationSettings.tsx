import { useEffect, useState } from 'react';
import { UserPlus, Shield, Trash2, Mail, Users, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuthStore } from '../../store/authStore';
import { organizationsApi, OrganizationMember } from '../../api/organizations.api';
import { Avatar } from '../../components/ui/avatar';
import { useTranslation } from '../../i18n/useTranslation';

export const OrganizationSettings = () => {
  const currentOrganizationId = useAuthStore((state) => state.currentOrganizationId);
  const currentUser = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const data = await organizationsApi.getMembers(currentOrganizationId);
      setMembers(data);
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentOrganizationId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId || !inviteEmail) return;
    
    try {
      setLoading(true);
      await organizationsApi.addMember(currentOrganizationId, { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      await fetchMembers();
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!currentOrganizationId || !window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await organizationsApi.removeMember(currentOrganizationId, userId);
      await fetchMembers();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to remove member');
    }
  };

  if (!currentOrganizationId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Please select an organization first.
      </div>
    );
  }

  const isAdminOrOwner = currentUser?.role === 'ADMIN' || currentUser?.role === 'OWNER';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Organization Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your organization members and roles.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {isAdminOrOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invite New Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-4 items-end">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    type="email" 
                    placeholder="colleague@company.com" 
                    className="pl-10"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 w-48">
                <label className="text-sm font-medium text-slate-300">Role</label>
                <select 
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <Button type="submit" disabled={loading} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Send Invite
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Members List ({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-800">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Avatar fallback={member.user.name[0]} src={member.user.avatarUrl} />
                  <div>
                    <p className="font-medium text-slate-100">{member.user.name}</p>
                    <p className="text-sm text-slate-400">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                    <Shield className="h-4 w-4 text-primary" />
                    {member.role}
                  </div>
                  {isAdminOrOwner && currentUser?.id !== member.user.id && (
                    <Button 
                      variant="ghost" 
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                      onClick={() => handleRemove(member.user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && !loading && (
              <p className="text-center py-4 text-slate-500">No members found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
