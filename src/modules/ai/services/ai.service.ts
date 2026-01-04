import { v4 as uuid } from 'uuid';

import type { AIOverviewData, ChatMessage, InsightGroup, PredictionSummary } from '../types/ai.types';
import { fetchAIOverview as fetchAIOverviewFromApi, generateAIResponse } from './openai.service';

export const fetchAIOverview = async (): Promise<AIOverviewData> => fetchAIOverviewFromApi();

export const fetchInsightGroups = async (): Promise<InsightGroup[]> => {
  const overview = await fetchAIOverview();
  return [
    { title: 'CRM Рекомендації', insights: overview.crm.recommendations },
    { title: 'HR Рекомендації', insights: overview.hr.recommendations },
    { title: 'Комунікації', insights: overview.communications.autoReplies },
    { title: 'Бухгалтерія', insights: overview.accounting.anomalies }
  ];
};

export const fetchPredictionSummaries = async (): Promise<PredictionSummary[]> => {
  const overview = await fetchAIOverview();
  return [
    {
      title: 'Cash Flow Forecast',
      description: 'Базовий сценарій показує позитивний потік у найближчі 6 місяців.',
      confidence: 0.83,
      forecast: overview.accounting.forecast
    },
    {
      title: 'Pipeline Conversion',
      description: 'Очікуваний рівень закриття угод — 34% при активності вище 70%.',
      confidence: 0.72,
      forecast: overview.accounting.forecast
    }
  ];
};

export const askAssistant = async (messages: ChatMessage[]) => {
  const answer = await generateAIResponse({ messages });
  return {
    id: uuid(),
    content: answer,
    role: 'assistant' as const,
    timestamp: Date.now()
  };
};
