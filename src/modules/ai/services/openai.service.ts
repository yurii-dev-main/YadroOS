import { apiClient } from '../../../services/apiClient';
import type { AIOverviewData, ChatMessage } from '../types/ai.types';

export interface GenerateResponseParams {
  messages: ChatMessage[];
}

export const generateAIResponse = async ({ messages }: GenerateResponseParams): Promise<{ content: string; actions?: Record<string, unknown>[] }> => {
  const response = await apiClient.post<{ content: string; actions?: Record<string, unknown>[] }>('/v1/ai/chat', { messages });
  return response.data;
};

export const fetchAIOverview = async (): Promise<AIOverviewData> => {
  const response = await apiClient.get<AIOverviewData>('/v1/ai/insights');
  return response.data;
};
