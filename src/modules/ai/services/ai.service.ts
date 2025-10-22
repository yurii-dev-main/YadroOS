import { v4 as uuid } from 'uuid';

import type {
  AIOverviewData,
  ChatMessage,
  InsightGroup,
  PredictionSummary,
  Recommendation
} from '../types/ai.types';
import {
  buildBonusModels,
  evaluateDealProbabilities,
  forecastCashFlow,
  scoreLeads,
  scorePerformance
} from './ml.service';
import { generateAIResponse } from './openai.service';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchAIOverview = async (): Promise<AIOverviewData> => {
  await delay(280);

  const leadProfiles = [
    {
      id: 'lead-1',
      name: 'NovaCom',
      companySize: 320,
      industry: 'Technology',
      engagement: 82,
      budget: 95000
    },
    {
      id: 'lead-2',
      name: 'AgroLine',
      companySize: 120,
      industry: 'Manufacturing',
      engagement: 65,
      budget: 54000
    },
    {
      id: 'lead-3',
      name: 'FinCore',
      companySize: 560,
      industry: 'Finance',
      engagement: 74,
      budget: 125000
    }
  ];

  const deals = [
    {
      id: 'deal-1',
      name: 'NovaCom Expansion',
      stage: 'Negotiation',
      daysInStage: 12,
      activityScore: 88,
      value: 74000,
      owner: 'Олена Гринь'
    },
    {
      id: 'deal-2',
      name: 'AgroLine Pilot',
      stage: 'Proposal',
      daysInStage: 24,
      activityScore: 54,
      value: 32000,
      owner: 'Ігор Коваль'
    }
  ];

  const sentimentSamples = [
    {
      id: 'sent-1',
      channel: 'email' as const,
      customer: 'NovaCom',
      sentiment: 'positive' as const,
      text: 'Команда підтримки спрацювала чудово, дякую за швидку відповідь!',
      timestamp: new Date().toISOString()
    },
    {
      id: 'sent-2',
      channel: 'chat' as const,
      customer: 'Delta Group',
      sentiment: 'negative' as const,
      text: 'Ми все ще очікуємо інтеграцію. Це затягується.',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const performanceMetrics = [
    {
      employeeId: 'emp-1',
      employeeName: 'Іван Петренко',
      department: 'Sales',
      kpiScore: 92,
      attendance: 98,
      managerRating: 88,
      peerReviews: 86,
      clientFeedback: 90,
      tenureMonths: 36
    },
    {
      employeeId: 'emp-2',
      employeeName: 'Олена Коваленко',
      department: 'Engineering',
      kpiScore: 78,
      attendance: 94,
      managerRating: 82,
      peerReviews: 84,
      tenureMonths: 28
    }
  ];

  const baseSalaries = {
    'emp-1': 4800,
    'emp-2': 5400
  };

  const crmLeadScores = scoreLeads(leadProfiles);
  const crmDealProbabilities = evaluateDealProbabilities(deals);
  const performanceScores = scorePerformance(performanceMetrics);
  const bonusModels = buildBonusModels(performanceMetrics, baseSalaries, 1.08);
  const cashForecast = forecastCashFlow([280000, 305000, 330000, 350000, 365000, 384000], 6);

  const crmRecommendations: Recommendation[] = [
    {
      id: uuid(),
      title: 'Найкращий час для контакту',
      description: 'NovaCom відповідає між 10:00-12:00, рекомендовано запланувати дзвінок у середу.',
      type: 'action',
      confidence: 0.86
    },
    {
      id: uuid(),
      title: 'Наступний крок для Delta Group',
      description: 'Запропонуйте воркшоп по впровадженню, щоб пришвидшити підписання договору.',
      type: 'action',
      confidence: 0.74
    },
    {
      id: uuid(),
      title: 'Ризик відтоку клієнта',
      description: 'Delta Group демонструє негативний тон листування та низьку активність останні 2 тижні.',
      type: 'alert',
      confidence: 0.69
    }
  ];

  const hrRecommendations: Recommendation[] = [
    {
      id: uuid(),
      title: 'Готовність до підвищення',
      description: 'Іван Петренко: високий performance score та 36 місяців в компанії.',
      type: 'insight',
      confidence: 0.81
    },
    {
      id: uuid(),
      title: 'Ризик звільнення',
      description: 'Олена Коваленко: зниження залученості (-9% останній місяць), рекомендовано провести зустріч.',
      type: 'alert',
      confidence: 0.66
    }
  ];

  return {
    crm: {
      leadScores: crmLeadScores,
      dealProbabilities: crmDealProbabilities,
      recommendations: crmRecommendations,
      sentimentTrend: [
        { date: 'Тиждень 1', score: 0.68 },
        { date: 'Тиждень 2', score: 0.71 },
        { date: 'Тиждень 3', score: 0.64 },
        { date: 'Тиждень 4', score: 0.76 }
      ],
      sentimentSamples
    },
    hr: {
      performance: performanceScores,
      bonusBreakdown: bonusModels,
      recommendations: hrRecommendations,
      talentMatches: [
        {
          employeeId: 'emp-1',
          employeeName: 'Іван Петренко',
          matchScore: 0.87,
          recommendedRole: 'Регіональний керівник продажів',
          skillGaps: ['Стратегічне планування']
        },
        {
          employeeId: 'emp-2',
          employeeName: 'Олена Коваленко',
          matchScore: 0.74,
          recommendedRole: 'Технічний лід',
          skillGaps: ['Керування командами', 'Комунікація з клієнтами']
        }
      ]
    },
    communications: {
      inbox: [
        {
          id: uuid(),
          category: 'Support',
          priority: 'urgent',
          summary: 'Ескалація по клієнту Delta Group. Потрібне втручання технічного відділу.',
          suggestedActions: ['Призначити call', 'Оновити статус в CRM']
        },
        {
          id: uuid(),
          category: 'Sales',
          priority: 'normal',
          summary: 'Запит на комерційну пропозицію від Innotech. Можливий upsell.',
          suggestedActions: ['Підготувати презентацію', 'Додати до pipeline']
        }
      ],
      autoReplies: [
        {
          id: uuid(),
          title: 'Відповідь на запит підтримки',
          description: 'Дякуємо за звернення! Ми повернемося з оновленням протягом 4 годин. Тим часом ви можете перевірити статус у кабінеті.',
          type: 'action',
          confidence: 0.9
        },
        {
          id: uuid(),
          title: 'Лист для прогріву ліда',
          description: 'Привіт! Ділюся кейсом впровадження у Delta Group. Буду радий обговорити потенційні сценарії для вашої команди.',
          type: 'action',
          confidence: 0.78
        }
      ]
    },
    accounting: {
      expenses: [
        {
          id: uuid(),
          statement: 'Найбільша стаття витрат у травні — хмарні сервіси ($38K)',
          category: 'Інфраструктура',
          delta: 0.18,
          unit: 'ratio'
        },
        {
          id: uuid(),
          statement: 'Порівняно з минулим місяцем витрати на маркетинг зменшились на 12%',
          category: 'Маркетинг',
          delta: -0.12,
          unit: 'ratio'
        }
      ],
      anomalies: [
        {
          id: uuid(),
          title: 'Потенційний дублікат рахунку',
          description: 'Рахунок #INV-2045 ($4 200) дублює транзакцію від 12.05.2024',
          type: 'alert',
          confidence: 0.62
        },
        {
          id: uuid(),
          title: 'Перевищення бюджету',
          description: 'Витрати R&D на 14% вище плану. Рекомендовано переглянути закупівлі обладнання.',
          type: 'alert',
          confidence: 0.71
        }
      ],
      forecast: cashForecast
    },
    executive: {
      metrics: [
        { id: 'metric-1', label: 'Revenue vs Forecast', value: '92%', change: -0.03 },
        { id: 'metric-2', label: 'Pipeline Value', value: '$3.8M', change: 0.08 },
        { id: 'metric-3', label: 'Headcount', value: 164, change: 0.02 },
        { id: 'metric-4', label: 'Cash Runway', value: '8.5 місяців', change: -0.5 }
      ],
      insights: [
        {
          id: uuid(),
          category: 'crm',
          severity: 'warning',
          message: 'Продажі відстають від прогнозу на 8%. Зосередьтесь на 3 угодах на стадії Negotiation.'
        },
        {
          id: uuid(),
          category: 'hr',
          severity: 'info',
          message: 'Ризик плинності кадрів у відділі підтримки +6%. Рекомендовано запланувати 1-на-1.'
        },
        {
          id: uuid(),
          category: 'finance',
          severity: 'critical',
          message: 'Runway 8.5 місяців. Розгляньте оптимізацію маркетингового бюджету (-10%).'
        }
      ],
      healthScore: 82
    }
  };
};

export const fetchInsightGroups = async (): Promise<InsightGroup[]> => {
  await delay(180);
  const overview = await fetchAIOverview();
  return [
    { title: 'CRM Рекомендації', insights: overview.crm.recommendations },
    { title: 'HR Рекомендації', insights: overview.hr.recommendations },
    { title: 'Комунікації', insights: overview.communications.autoReplies },
    { title: 'Бухгалтерія', insights: overview.accounting.anomalies }
  ];
};

export const fetchPredictionSummaries = async (): Promise<PredictionSummary[]> => {
  await delay(220);
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
  await delay(120);
  const answer = await generateAIResponse({ messages });
  return {
    id: uuid(),
    content: answer,
    role: 'assistant' as const,
    timestamp: Date.now()
  };
};
