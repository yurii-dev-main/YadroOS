import { apiClient } from '../../../services/apiClient';
import type { ChatMessage } from '../types/ai.types';

export interface GenerateResponseParams {
  messages: ChatMessage[];
}

export const generateAIResponse = async ({ messages }: GenerateResponseParams): Promise<string> => {
  const response = await apiClient.post<{ content: string }>('/v1/ai/chat', { messages });
  return response.data.content;
};
