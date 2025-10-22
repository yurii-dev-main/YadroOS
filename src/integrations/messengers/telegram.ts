import { apiClient } from '../../services/apiClient';
import type { CursorPaginationParams, SyncHistoryResponse } from '../types';

export interface TelegramCommand {
  command: string;
  description: string;
}

export interface TelegramGuideSection {
  title: string;
  steps: string[];
}

export interface TelegramBotGuide {
  sections: TelegramGuideSection[];
}

export class TelegramIntegration {
  private readonly basePath = '/integrations/messengers/telegram';

  getBotCreationGuide(): Promise<TelegramBotGuide> {
    return apiClient
      .get(`${this.basePath}/guide`)
      .then((response) => response.data as TelegramBotGuide);
  }

  saveBotToken(token: string): Promise<{ id: string; status: 'active' | 'inactive' }> {
    return apiClient
      .post(`${this.basePath}/bot-token`, { token })
      .then((response) => response.data as { id: string; status: 'active' | 'inactive' });
  }

  rotateBotToken(botId: string): Promise<{ token: string }> {
    return apiClient
      .post(`${this.basePath}/bots/${botId}/rotate-token`)
      .then((response) => response.data as { token: string });
  }

  configureWebhook(botId: string, callbackUrl: string): Promise<void> {
    return apiClient
      .post(`${this.basePath}/bots/${botId}/webhook`, { callbackUrl })
      .then(() => undefined);
  }

  listCommands(botId: string): Promise<TelegramCommand[]> {
    return apiClient
      .get(`${this.basePath}/bots/${botId}/commands`)
      .then((response) => response.data as TelegramCommand[]);
  }

  setCommands(botId: string, commands: TelegramCommand[]): Promise<TelegramCommand[]> {
    return apiClient
      .post(`${this.basePath}/bots/${botId}/commands`, { commands })
      .then((response) => response.data as TelegramCommand[]);
  }

  sendMessage(botId: string, chatId: string, text: string): Promise<SyncHistoryResponse> {
    return apiClient
      .post(`${this.basePath}/bots/${botId}/send`, { chatId, text })
      .then((response) => response.data as SyncHistoryResponse);
  }

  getDeliveryLogs(botId: string, params?: CursorPaginationParams): Promise<SyncHistoryResponse> {
    return apiClient
      .get(`${this.basePath}/bots/${botId}/logs`, { params })
      .then((response) => response.data as SyncHistoryResponse);
  }
}

export const telegramIntegration = new TelegramIntegration();
