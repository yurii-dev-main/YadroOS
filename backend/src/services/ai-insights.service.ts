import { randomUUID } from 'crypto';

export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface LeadProfile {
  id: string;
  name: string;
  companySize: number;
  industry: string;
  engagement: number;
  budget: number;
}

export interface LeadScoreResult {
  lead: LeadProfile;
  score: number;
  factors: Array<{ label: string; value: number }>;
  explanation: string;
}

export interface DealProfile {
  id: string;
  name: string;
  stage: string;
  daysInStage: number;
  activityScore: number;
  value: number;
  owner: string;
}

export interface DealProbabilityResult {
  deal: DealProfile;
  probability: number;
  drivers: Array<{ label: string; impact: number }>;
  recommendations: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'insight' | 'alert';
  confidence: number;
}

export interface SentimentSample {
  id: string;
  channel: 'email' | 'chat';
  customer: string;
  sentiment: SentimentLabel;
  text: string;
  timestamp: string;
}

export interface SentimentTrendPoint {
  date: string;
  score: number;
}

export interface PerformanceMetric {
  employeeId: string;
  employeeName: string;
  department: string;
  kpiScore: number;
  attendance: number;
  managerRating: number;
  peerReviews: number;
  clientFeedback?: number;
  tenureMonths: number;
}

export interface PerformanceScoreResult {
  employeeId: string;
  employeeName: string;
  normalizedScore: number;
  trend: 'improving' | 'stable' | 'declining';
  highlights: string[];
}

export interface BonusBreakdown {
  employeeId: string;
  bonusAmount: number;
  baseSalary: number;
  performanceCoefficient: number;
  companyModifier: number;
  components: Array<{ label: string; weight: number; value: number }>;
}

export interface TalentMatch {
  employeeId: string;
  employeeName: string;
  matchScore: number;
  recommendedRole: string;
  skillGaps: string[];
}

export interface CommunicationInsight {
  id: string;
  category: string;
  priority: 'urgent' | 'normal' | 'low';
  summary: string;
  suggestedActions: string[];
}

export interface ExpenseInsight {
  id: string;
  statement: string;
  category?: string;
  delta?: number;
  unit?: string;
}

export interface ForecastPoint {
  period: string;
  value: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastScenario {
  horizonMonths: number;
  baseline: ForecastPoint[];
  bestCase: ForecastPoint[];
  worstCase: ForecastPoint[];
}

export interface ExecutiveMetric {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  unit?: string;
}

export interface ExecutiveInsight {
  id: string;
  message: string;
  category: 'crm' | 'hr' | 'finance';
  severity: 'info' | 'warning' | 'critical';
}

export interface AIOverviewData {
  crm: {
    leadScores: LeadScoreResult[];
    dealProbabilities: DealProbabilityResult[];
    recommendations: Recommendation[];
    sentimentTrend: SentimentTrendPoint[];
    sentimentSamples: SentimentSample[];
  };
  hr: {
    performance: PerformanceScoreResult[];
    bonusBreakdown: BonusBreakdown[];
    recommendations: Recommendation[];
    talentMatches: TalentMatch[];
  };
  communications: {
    inbox: CommunicationInsight[];
    autoReplies: Recommendation[];
  };
  accounting: {
    expenses: ExpenseInsight[];
    anomalies: Recommendation[];
    forecast: ForecastScenario;
  };
  executive: {
    metrics: ExecutiveMetric[];
    insights: ExecutiveInsight[];
    healthScore: number;
  };
}

const INDUSTRY_WEIGHTS: Record<string, number> = {
  technology: 1.1,
  finance: 1.05,
  healthcare: 1.08,
  manufacturing: 0.95,
  retail: 0.9,
  other: 1
};

const calculateLeadScore = (lead: LeadProfile): LeadScoreResult => {
  const industryWeight = INDUSTRY_WEIGHTS[lead.industry.toLowerCase()] ?? INDUSTRY_WEIGHTS.other;
  const sizeScore = Math.min(lead.companySize / 200, 1) * 25;
  const engagementScore = Math.min(lead.engagement / 100, 1) * 35;
  const budgetScore = Math.min(lead.budget / 100000, 1) * 25;
  const industryScore = industryWeight * 15;

  const rawScore = sizeScore + engagementScore + budgetScore + industryScore;
  const score = Math.round(Math.min(rawScore, 100));

  const explanation = `Компанія у сегменті ${lead.industry} з бюджетом ${lead.budget.toLocaleString()} USD та рівнем залучення ${lead.engagement}%`;

  return {
    lead,
    score,
    factors: [
      { label: 'Розмір компанії', value: Math.round(sizeScore) },
      { label: 'Залученість', value: Math.round(engagementScore) },
      { label: 'Бюджет', value: Math.round(budgetScore) },
      { label: 'Індустрія', value: Math.round(industryScore) }
    ],
    explanation
  };
};

const calculateDealProbability = (deal: DealProfile): DealProbabilityResult => {
  const stageWeights: Record<string, number> = {
    qualification: 0.25,
    discovery: 0.35,
    proposal: 0.55,
    negotiation: 0.75,
    closedwon: 0.95
  };

  const stageWeight = stageWeights[deal.stage.toLowerCase()] ?? 0.2;
  const timePenalty = Math.max(1 - deal.daysInStage / 45, 0.6);
  const activityBoost = 0.5 + deal.activityScore / 200;
  const valueInfluence = Math.min(deal.value / 50000, 1);

  const probability = Math.round(
    Math.min(stageWeight * timePenalty * activityBoost * 100 + valueInfluence * 10, 100)
  );

  const drivers = [
    { label: 'Стадія угоди', impact: Math.round(stageWeight * 100) },
    { label: 'Дні у стадії', impact: Math.round(timePenalty * 100) },
    { label: 'Активність команди', impact: Math.round(activityBoost * 100) },
    { label: 'Вартість угоди', impact: Math.round(valueInfluence * 100) }
  ];

  const recommendations = [
    probability < 60 && 'Заплануйте зустріч з економічним замовником',
    deal.daysInStage > 20 && 'Оновіть наступні кроки, щоб уникнути застою',
    deal.activityScore < 60 && 'Залучіть маркетинг для підтримки угоди'
  ].filter(Boolean) as string[];

  return {
    deal,
    probability,
    drivers,
    recommendations: recommendations.length
      ? recommendations
      : ['Підтримуйте поточний темп взаємодії для успішного закриття']
  };
};

const calculatePerformanceScore = (metric: PerformanceMetric): PerformanceScoreResult => {
  const departmentNormalization: Record<string, number> = {
    sales: 0.92,
    engineering: 1.05,
    marketing: 0.98,
    hr: 1,
    finance: 0.95
  };

  const weights = {
    kpi: 0.4,
    attendance: 0.2,
    manager: 0.2,
    peer: 0.1,
    client: 0.1
  };

  const departmentFactor = departmentNormalization[metric.department.toLowerCase()] ?? 1;

  const clientComponent = metric.clientFeedback ?? 80;
  const rawScore =
    metric.kpiScore * weights.kpi +
    metric.attendance * weights.attendance +
    metric.managerRating * weights.manager +
    metric.peerReviews * weights.peer +
    clientComponent * weights.client;

  const normalizedScore = Math.round(Math.min(rawScore * departmentFactor, 100));

  const trend = normalizedScore > 85 ? 'improving' : normalizedScore < 65 ? 'declining' : 'stable';

  const highlights = [
    metric.kpiScore > 85 && 'Перевиконання KPI',
    metric.attendance > 95 && 'Відмінна відвідуваність',
    metric.managerRating > 90 && 'Висока оцінка менеджера',
    metric.peerReviews > 85 && 'Позитивні відгуки колег'
  ].filter(Boolean) as string[];

  return {
    employeeId: metric.employeeId,
    employeeName: metric.employeeName,
    normalizedScore,
    trend,
    highlights: highlights.length ? highlights : ['Стабільна продуктивність']
  };
};

const calculateBonusBreakdown = (
  metric: PerformanceMetric,
  baseSalary: number,
  companyModifier: number
): BonusBreakdown => {
  const weights = {
    kpi: 0.4,
    attendance: 0.2,
    manager: 0.2,
    peer: 0.1,
    client: metric.clientFeedback ? 0.1 : 0
  };

  const performanceCoefficient =
    (metric.kpiScore / 100) * weights.kpi +
    (metric.attendance / 100) * weights.attendance +
    (metric.managerRating / 100) * weights.manager +
    (metric.peerReviews / 100) * weights.peer +
    ((metric.clientFeedback ?? 80) / 100) * weights.client;

  const normalizedCoefficient = Math.max(0.8, Math.min(performanceCoefficient * 1.8, 1.5));

  const bonusAmount = Math.round(baseSalary * normalizedCoefficient * companyModifier * 0.2);

  const components: BonusBreakdown['components'] = [
    { label: 'KPI', weight: weights.kpi, value: metric.kpiScore },
    { label: 'Відвідуваність', weight: weights.attendance, value: metric.attendance },
    { label: 'Оцінка менеджера', weight: weights.manager, value: metric.managerRating },
    { label: 'Відгуки колег', weight: weights.peer, value: metric.peerReviews }
  ];

  if (weights.client > 0) {
    components.push({
      label: 'Відгуки клієнтів',
      weight: weights.client,
      value: metric.clientFeedback ?? 0
    });
  }

  return {
    employeeId: metric.employeeId,
    bonusAmount,
    baseSalary,
    performanceCoefficient: Number(normalizedCoefficient.toFixed(2)),
    companyModifier,
    components
  };
};

const createConfidenceBand = (value: number, variance: number): [number, number] => {
  const margin = value * variance;
  return [Math.max(value - margin, 0), value + margin];
};

const buildForecastScenario = (
  baseline: number[],
  labelPrefix: string,
  variance = 0.12
): ForecastScenario => {
  const baselinePoints: ForecastPoint[] = baseline.map((value, index) => {
    const period = `${labelPrefix} ${index + 1}`;
    const [lowerBound, upperBound] = createConfidenceBand(value, variance);
    return { period, value, lowerBound, upperBound };
  });

  const adjustSeries = (series: ForecastPoint[], factor: number) =>
    series.map((point) => ({
      ...point,
      value: Math.round(point.value * factor),
      lowerBound: Math.round(point.lowerBound * factor),
      upperBound: Math.round(point.upperBound * factor)
    }));

  return {
    horizonMonths: baseline.length,
    baseline: baselinePoints,
    bestCase: adjustSeries(baselinePoints, 1.12),
    worstCase: adjustSeries(baselinePoints, 0.88)
  };
};

const smoothTrend = (values: number[]): number[] => {
  if (!values.length) {
    return [];
  }
  const smoothed: number[] = [];
  for (let i = 0; i < values.length; i += 1) {
    const window = values.slice(Math.max(0, i - 2), i + 1);
    const average = window.reduce((acc, value) => acc + value, 0) / window.length;
    smoothed.push(Number(average.toFixed(2)));
  }
  return smoothed;
};

const forecastCashFlow = (historical: number[], horizon = 6): ForecastScenario => {
  const smoothed = smoothTrend(historical);
  const growthRate = smoothed.length > 1 ? smoothed.at(-1)! / smoothed[0]! : 1;
  const monthGrowth = Math.pow(growthRate, 1 / Math.max(smoothed.length - 1, 1));

  const baseline: number[] = [];
  let current = smoothed.at(-1) ?? historical.at(-1) ?? 0;
  for (let i = 0; i < horizon; i += 1) {
    current *= monthGrowth;
    baseline.push(Math.round(current));
  }

  return buildForecastScenario(baseline, 'Місяць');
};

const scoreLeads = (leads: LeadProfile[]): LeadScoreResult[] => leads.map(calculateLeadScore);

const evaluateDealProbabilities = (deals: DealProfile[]): DealProbabilityResult[] =>
  deals.map(calculateDealProbability);

const scorePerformance = (metrics: PerformanceMetric[]): PerformanceScoreResult[] =>
  metrics.map(calculatePerformanceScore);

const buildBonusModels = (
  metrics: PerformanceMetric[],
  baseSalaries: Record<string, number>,
  companyModifier: number
): BonusBreakdown[] =>
  metrics.map((metric) =>
    calculateBonusBreakdown(metric, baseSalaries[metric.employeeId] ?? 3200, companyModifier)
  );

export const getAIOverview = (): AIOverviewData => {
  const leadProfiles: LeadProfile[] = [
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

  const deals: DealProfile[] = [
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

  const sentimentSamples: SentimentSample[] = [
    {
      id: 'sent-1',
      channel: 'email',
      customer: 'NovaCom',
      sentiment: 'positive',
      text: 'Команда підтримки спрацювала чудово, дякую за швидку відповідь!',
      timestamp: new Date().toISOString()
    },
    {
      id: 'sent-2',
      channel: 'chat',
      customer: 'Delta Group',
      sentiment: 'negative',
      text: 'Ми все ще очікуємо інтеграцію. Це затягується.',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const performanceMetrics: PerformanceMetric[] = [
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

  const baseSalaries: Record<string, number> = {
    'emp-1': 4800,
    'emp-2': 5400
  };

  const crmLeadScores = scoreLeads(leadProfiles);
  const crmDealProbabilities = evaluateDealProbabilities(deals);
  const performanceScores = scorePerformance(performanceMetrics);
  const bonusModels = buildBonusModels(performanceMetrics, baseSalaries, 1.08);
  const cashForecast = forecastCashFlow(
    [280000, 305000, 330000, 350000, 365000, 384000],
    6
  );

  const crmRecommendations: Recommendation[] = [
    {
      id: randomUUID(),
      title: 'Найкращий час для контакту',
      description:
        'NovaCom відповідає між 10:00-12:00, рекомендовано запланувати дзвінок у середу.',
      type: 'action',
      confidence: 0.86
    },
    {
      id: randomUUID(),
      title: 'Наступний крок для Delta Group',
      description: 'Запропонуйте воркшоп по впровадженню, щоб пришвидшити підписання договору.',
      type: 'action',
      confidence: 0.74
    },
    {
      id: randomUUID(),
      title: 'Ризик відтоку клієнта',
      description:
        'Delta Group демонструє негативний тон листування та низьку активність останні 2 тижні.',
      type: 'alert',
      confidence: 0.69
    }
  ];

  const hrRecommendations: Recommendation[] = [
    {
      id: randomUUID(),
      title: 'Готовність до підвищення',
      description: 'Іван Петренко: високий performance score та 36 місяців в компанії.',
      type: 'insight',
      confidence: 0.81
    },
    {
      id: randomUUID(),
      title: 'Ризик звільнення',
      description:
        'Олена Коваленко: зниження залученості (-9% останній місяць), рекомендовано провести зустріч.',
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
          id: randomUUID(),
          category: 'Billing',
          priority: 'urgent',
          summary: 'Клієнт NovaCom очікує підтвердження оплати рахунку #INV-2045.',
          suggestedActions: ['Перевірити оплату в банку', 'Надіслати підтвердження клієнту']
        },
        {
          id: randomUUID(),
          category: 'Support',
          priority: 'normal',
          summary: 'Delta Group потребує оновлення щодо інтеграції CRM.',
          suggestedActions: ['Узгодити ETA з технічною командою', 'Підготувати email-оновлення']
        }
      ],
      autoReplies: [
        {
          id: randomUUID(),
          title: 'Шаблон відповіді на затримку',
          description:
            'Дякуємо за ваше звернення! Ми працюємо над інтеграцією та надамо оновлення протягом 24 годин.',
          type: 'action',
          confidence: 0.77
        },
        {
          id: randomUUID(),
          title: 'Формулювання для узгодження рахунку',
          description:
            'Рахунок #INV-2045 опрацьовується фінансовим відділом. Підтвердження буде надіслане після звірки.',
          type: 'insight',
          confidence: 0.7
        }
      ]
    },
    accounting: {
      expenses: [
        {
          id: randomUUID(),
          statement: 'Витрати на логістику зросли на 8% через сезонний попит.',
          category: 'Логістика',
          delta: 0.08,
          unit: 'ratio'
        },
        {
          id: randomUUID(),
          statement: 'Рівень витрат на інфраструктуру стабілізувався після оптимізації.',
          category: 'Інфраструктура',
          delta: 0.18,
          unit: 'ratio'
        },
        {
          id: randomUUID(),
          statement: 'Порівняно з минулим місяцем витрати на маркетинг зменшились на 12%',
          category: 'Маркетинг',
          delta: -0.12,
          unit: 'ratio'
        }
      ],
      anomalies: [
        {
          id: randomUUID(),
          title: 'Потенційний дублікат рахунку',
          description: 'Рахунок #INV-2045 ($4 200) дублює транзакцію від 12.05.2024',
          type: 'alert',
          confidence: 0.62
        },
        {
          id: randomUUID(),
          title: 'Перевищення бюджету',
          description:
            'Витрати R&D на 14% вище плану. Рекомендовано переглянути закупівлі обладнання.',
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
          id: randomUUID(),
          category: 'crm',
          severity: 'warning',
          message:
            'Продажі відстають від прогнозу на 8%. Зосередьтесь на 3 угодах на стадії Negotiation.'
        },
        {
          id: randomUUID(),
          category: 'hr',
          severity: 'info',
          message:
            'Ризик плинності кадрів у відділі підтримки +6%. Рекомендовано запланувати 1-на-1.'
        },
        {
          id: randomUUID(),
          category: 'finance',
          severity: 'critical',
          message: 'Runway 8.5 місяців. Розгляньте оптимізацію маркетингового бюджету (-10%).'
        }
      ],
      healthScore: 82
    }
  };
};
