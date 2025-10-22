import { apiClient } from '../../services/apiClient';
import type { IntegrationConnection } from '../types';

export interface SmtpImapConfiguration {
  host: string;
  port: number;
  username: string;
  password: string;
  protocol: 'smtp' | 'imap';
  secure: boolean;
}

export class CustomSmtpIntegration {
  private readonly basePath = '/integrations/email/custom-smtp';

  validateConfiguration(config: SmtpImapConfiguration): Promise<{ success: boolean; message?: string }> {
    return apiClient
      .post(`${this.basePath}/validate`, config)
      .then((response) => response.data as { success: boolean; message?: string });
  }

  saveConfiguration(config: SmtpImapConfiguration): Promise<IntegrationConnection> {
    return apiClient
      .post(`${this.basePath}/connections`, config)
      .then((response) => response.data as IntegrationConnection);
  }

  deleteConfiguration(connectionId: string): Promise<void> {
    return apiClient
      .delete(`${this.basePath}/connections/${connectionId}`)
      .then(() => undefined);
  }
}

export const customSmtpIntegration = new CustomSmtpIntegration();
