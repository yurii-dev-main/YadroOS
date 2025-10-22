import { apiClient } from '../../services/apiClient';
import type { ApiBulkResponse, ApiListRequest, ApiListResponse } from '../types';

export interface EmployeeRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department?: string;
  managerId?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'onboarding' | 'terminated';
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'unpaid' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
}

export const hrRoutes = {
  listEmployees(request?: ApiListRequest) {
    return apiClient
      .get<ApiListResponse<EmployeeRecord>>('/hr/employees', { params: request })
      .then((response) => response.data);
  },
  upsertEmployee(employeeId: string | null, payload: Partial<EmployeeRecord>) {
    if (employeeId) {
      return apiClient
        .put<EmployeeRecord>(`/hr/employees/${employeeId}`, payload)
        .then((response) => response.data);
    }

    return apiClient.post<EmployeeRecord>('/hr/employees', payload).then((response) => response.data);
  },
  archiveEmployee(employeeId: string) {
    return apiClient.delete(`/hr/employees/${employeeId}`).then(() => undefined);
  },
  importEmployees(payload: FormData) {
    return apiClient
      .post<ApiBulkResponse<EmployeeRecord>>('/hr/employees/import', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((response) => response.data);
  },
  listTimeOffRequests(request?: ApiListRequest) {
    return apiClient
      .get<ApiListResponse<TimeOffRequest>>('/hr/time-off', { params: request })
      .then((response) => response.data);
  },
  approveTimeOffRequest(requestId: string) {
    return apiClient
      .post<TimeOffRequest>(`/hr/time-off/${requestId}/approve`)
      .then((response) => response.data);
  },
  rejectTimeOffRequest(requestId: string, reason: string) {
    return apiClient
      .post<TimeOffRequest>(`/hr/time-off/${requestId}/reject`, { reason })
      .then((response) => response.data);
  }
};
