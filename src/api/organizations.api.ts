import { apiClient } from '../services/apiClient';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  myRole: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

export const organizationsApi = {
  async getMyOrganizations(): Promise<Organization[]> {
    const { data } = await apiClient.get('/v1/organizations');
    return data;
  },
  async createOrganization(params: { name: string; slug: string; industry?: string }): Promise<Organization> {
    const { data } = await apiClient.post('/v1/organizations', params);
    return data;
  },
  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const { data } = await apiClient.get(`/v1/organizations/${organizationId}/members`);
    return data;
  },
  async addMember(organizationId: string, params: { email: string; role: string }): Promise<OrganizationMember> {
    const { data } = await apiClient.post(`/v1/organizations/${organizationId}/members`, params);
    return data;
  },
  async removeMember(organizationId: string, userId: string): Promise<void> {
    await apiClient.delete(`/v1/organizations/${organizationId}/members/${userId}`);
  }
};
