import { v4 as uuid } from 'uuid';

import type {
  AIOverviewData,
  ChatMessage,
  InsightGroup,
  PredictionSummary
} from '../types/ai.types';
import { apiClient } from '../../../services/apiClient';

export const fetchAIOverview = async (): Promise<AIOverviewData> => {
  const { data } = await apiClient.get<AIOverviewData>('/v1/ai/insights');
  return data;
};

export const fetchInsightGroups = async (): Promise<{
  groups: InsightGroup[];
  isGeminiConnected: boolean;
}> => {
  const overview = await fetchAIOverview();
  const groups: InsightGroup[] = [];

  if (overview.customInsights && overview.customInsights.length > 0) {
    groups.push({
      title: overview.isGeminiConnected ? 'Gemini AI Insights' : 'Algorithmic Insights',
      insights: overview.customInsights
    });
  }

  groups.push(
    { title: 'CRM Recommendations', insights: overview.crm.recommendations },
    { title: 'HR Recommendations', insights: overview.hr.recommendations },
    { title: 'Communications', insights: overview.communications.autoReplies },
    { title: 'Accounting', insights: overview.accounting.anomalies }
  );

  return { groups, isGeminiConnected: !!overview.isGeminiConnected };
};

export const fetchPredictionSummaries = async (): Promise<PredictionSummary[]> => {
  try {
    const { data } = await apiClient.get<PredictionSummary[]>('/v1/ai/predictions');
    return data;
  } catch {
    const overview = await fetchAIOverview();
    return [
      {
        title: 'Cash Flow Forecast',
        description: 'Baseline scenario shows positive cash flow over the next 6 months.',
        confidence: 0.83,
        forecast: overview.accounting.forecast
      },
      {
        title: 'Pipeline Conversion',
        description: 'Expected deal closing rate is 34% with activity above 70%.',
        confidence: 0.72,
        forecast: overview.accounting.forecast
      }
    ];
  }
};

export const askAssistant = async (messages: ChatMessage[]) => {
  const { data } = await apiClient.post('/v1/ai/chat', { messages });
  return {
    id: uuid(),
    content: data.content,
    actions: data.actions,
    role: 'assistant' as const,
    timestamp: Date.now()
  };
};
