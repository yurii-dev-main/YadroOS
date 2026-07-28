import { apiClient } from '../../../services/apiClient';
import type { AIOverviewData, ChatMessage, ChatAction } from '../types/ai.types';

export interface GenerateResponseParams {
  messages: ChatMessage[];
}

import { IS_DEMO_MODE } from '../../../services/apiClient';

export const generateAIResponse = async ({
  messages
}: GenerateResponseParams): Promise<{ content: string; actions?: ChatAction[] }> => {
  if (IS_DEMO_MODE) {
    return {
      content: "I'm the AI Assistant in demo mode! I can help you analyze your CRM, HR, or Accounting data.",
      actions: []
    };
  }
  const response = await apiClient.post<{ content: string; actions?: ChatAction[] }>(
    '/v1/ai/chat',
    { messages }
  );
  return response.data;
};

export const fetchAIOverview = async (): Promise<AIOverviewData> => {
  if (IS_DEMO_MODE) {
    return {
      crm: {
        leadScores: [
          {
            lead: { id: '1', name: 'John Doe', companySize: 100, industry: 'Tech', engagement: 80, budget: 10000 },
            score: 85,
            factors: [{ label: 'High Engagement', value: 20 }, { label: 'Budget Match', value: 15 }],
            explanation: 'Strong engagement and budget match.'
          }
        ],
        dealProbabilities: [],
        recommendations: [
          { id: 'r1', title: 'Follow up with John', description: 'John opened your last email.', type: 'action', confidence: 0.9 }
        ],
        sentimentTrend: [
          { date: '2026-01-01', score: 65 }, { date: '2026-02-01', score: 70 },
          { date: '2026-03-01', score: 75 }, { date: '2026-04-01', score: 80 },
          { date: '2026-05-01', score: 78 }, { date: '2026-06-01', score: 85 }
        ],
        sentimentSamples: [
          { id: 's1', channel: 'email', customer: 'Alice', sentiment: 'positive', text: 'Great service!', timestamp: new Date().toISOString() }
        ]
      },
      hr: {
        performance: [
          { employeeId: 'e1', employeeName: 'Jane Smith', normalizedScore: 92, trend: 'improving', highlights: ['Top performer this quarter', 'Excellent client feedback'] }
        ],
        bonusBreakdown: [],
        recommendations: [
          { id: 'r2', title: 'Schedule 1:1 with Jane', description: 'Jane has been performing well.', type: 'action', confidence: 0.85 }
        ],
        talentMatches: [
          { employeeId: 'e2', employeeName: 'Bob', matchScore: 88, recommendedRole: 'Senior Developer', skillGaps: ['Leadership'] }
        ]
      },
      communications: {
        inbox: [
          { id: 'c1', category: 'Support', priority: 'urgent', summary: 'Server down reported by client', suggestedActions: ['Reply acknowledging issue'] },
          { id: 'c2', category: 'Sales', priority: 'normal', summary: 'New lead interested in enterprise plan', suggestedActions: ['Schedule demo'] }
        ],
        autoReplies: []
      },
      accounting: {
        expenses: [
          { id: 'ex1', statement: 'Cloud Hosting Costs', category: 'IT', delta: 15, unit: '%' }
        ],
        anomalies: [
          { id: 'a1', title: 'Unusual spike in marketing spend', description: 'Marketing spend is 40% higher than last month.', type: 'alert', confidence: 0.95 }
        ],
        forecast: {
          horizonMonths: 12,
          baseline: Array.from({ length: 12 }).map((_, i) => ({ period: `M${i+1}`, value: 100000 + i * 5000, lowerBound: 90000 + i * 4000, upperBound: 110000 + i * 6000 })),
          bestCase: [],
          worstCase: []
        }
      },
      executive: {
        metrics: [
          { id: 'm1', label: 'ARR', value: '$1.2M', change: 12 },
          { id: 'm2', label: 'Churn Rate', value: '2.4%', change: -0.5 }
        ],
        insights: [
          { id: 'i1', message: 'Strong quarter ahead based on pipeline velocity.', category: 'crm', severity: 'info' }
        ],
        healthScore: 78
      }
    };
  }
  const response = await apiClient.get<AIOverviewData>('/v1/ai/insights');
  return response.data;
};
