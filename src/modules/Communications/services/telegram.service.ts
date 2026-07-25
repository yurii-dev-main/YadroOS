import { apiClient } from '../../../services/apiClient';
import { TelegramConnectionStatus } from '../types/communication.types';

export const telegramService = {
  async fetchStatus() {
    const response = await apiClient.get<TelegramConnectionStatus>(
      '/v1/communications/telegram/status'
    );
    return response.data;
  },

  async updateStatus(status: Partial<TelegramConnectionStatus>) {
    const response = await apiClient.put<TelegramConnectionStatus>(
      '/v1/communications/telegram/status',
      status
    );
    return response.data;
  }
};
