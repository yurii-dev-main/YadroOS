import { apiClient } from '../../services/apiClient';

export interface WhatsAppTemplate {
  name: string;
  language: string;
  category: 'transactional' | 'marketing' | 'utility';
  components: Array<{
    type: 'body' | 'header' | 'footer' | 'button';
    text?: string;
    buttons?: Array<{
      type: 'quick_reply' | 'url';
      text: string;
      url?: string;
    }>;
  }>;
}

export class WhatsAppIntegration {
  private readonly basePath = '/integrations/messengers/whatsapp';

  configureAccount(payload: {
    businessId: string;
    phoneNumberId: string;
    accessToken: string;
  }): Promise<{ id: string }> {
    return apiClient
      .post(`${this.basePath}/account`, payload)
      .then((response) => response.data as { id: string });
  }

  listTemplates(): Promise<WhatsAppTemplate[]> {
    return apiClient
      .get(`${this.basePath}/templates`)
      .then((response) => response.data as WhatsAppTemplate[]);
  }

  sendTemplateMessage(
    phoneNumber: string,
    template: WhatsAppTemplate,
    variables: Record<string, string>
  ): Promise<{ deliveryId: string }> {
    return apiClient
      .post(`${this.basePath}/send`, { phoneNumber, template, variables })
      .then((response) => response.data as { deliveryId: string });
  }
}

export const whatsAppIntegration = new WhatsAppIntegration();
