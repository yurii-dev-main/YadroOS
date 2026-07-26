import { v4 as uuid } from 'uuid';

import type {
  AIOverviewData,
  ChatMessage,
  InsightGroup,
  PredictionSummary
} from '../types/ai.types';
import { fetchAIOverview as fetchAIOverviewFromApi, generateAIResponse } from './openai.service';

export const fetchAIOverview = async (): Promise<AIOverviewData> => fetchAIOverviewFromApi();

export const fetchInsightGroups = async (): Promise<InsightGroup[]> => {
  const overview = await fetchAIOverview();
  return [
    { title: 'CRM Recommendations', insights: overview.crm.recommendations },
    { title: 'HR Recommendations', insights: overview.hr.recommendations },
    { title: 'Communications', insights: overview.communications.autoReplies },
    { title: 'Accounting', insights: overview.accounting.anomalies }
  ];
};

export const fetchPredictionSummaries = async (): Promise<PredictionSummary[]> => {
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
};

export const askAssistant = async (messages: ChatMessage[]) => {
  const { content, actions } = await generateAIResponse({ messages });
  return {
    id: uuid(),
    content: content,
    actions: actions,
    role: 'assistant' as const,
    timestamp: Date.now()
  };
};
