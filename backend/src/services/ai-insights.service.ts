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

  const explanation = `Company in the ${lead.industry} segment with a budget of ${lead.budget.toLocaleString()} USD and an engagement level of ${lead.engagement}%`;

  return {
    lead,
    score,
    factors: [
      { label: 'Company size', value: Math.round(sizeScore) },
      { label: 'Engagement', value: Math.round(engagementScore) },
      { label: 'Budget', value: Math.round(budgetScore) },
      { label: 'Industry', value: Math.round(industryScore) }
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
    { label: 'Deal stage', impact: Math.round(stageWeight * 100) },
    { label: 'Days in stage', impact: Math.round(timePenalty * 100) },
    { label: 'Team activity', impact: Math.round(activityBoost * 100) },
    { label: 'Deal value', impact: Math.round(valueInfluence * 100) }
  ];

  const recommendations = [
    probability < 60 && 'Schedule a meeting with the decision maker',
    deal.daysInStage > 20 && 'Update next steps to avoid stagnation',
    deal.activityScore < 60 && 'Involve marketing to support the deal'
  ].filter(Boolean) as string[];

  return {
    deal,
    probability,
    drivers,
    recommendations: recommendations.length
      ? recommendations
      : ['Maintain current interaction pace for successful closing']
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
    metric.kpiScore > 85 && 'KPI overachievement',
    metric.attendance > 95 && 'Excellent attendance',
    metric.managerRating > 90 && 'High manager rating',
    metric.peerReviews > 85 && 'Positive peer reviews'
  ].filter(Boolean) as string[];

  return {
    employeeId: metric.employeeId,
    employeeName: metric.employeeName,
    normalizedScore,
    trend,
    highlights: highlights.length ? highlights : ['Stable performance']
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
    { label: 'Attendance', weight: weights.attendance, value: metric.attendance },
    { label: 'Manager rating', weight: weights.manager, value: metric.managerRating },
    { label: 'Peer reviews', weight: weights.peer, value: metric.peerReviews }
  ];

  if (weights.client > 0) {
    components.push({
      label: 'Client feedback',
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

  return buildForecastScenario(baseline, 'Month');
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
      owner: 'Olena Hryn'
    },
    {
      id: 'deal-2',
      name: 'AgroLine Pilot',
      stage: 'Proposal',
      daysInStage: 24,
      activityScore: 54,
      value: 32000,
      owner: 'Ihor Koval'
    }
  ];

  const sentimentSamples: SentimentSample[] = [
    {
      id: 'sent-1',
      channel: 'email',
      customer: 'NovaCom',
      sentiment: 'positive',
      text: 'The support team did a great job, thank you for the quick response!',
      timestamp: new Date().toISOString()
    },
    {
      id: 'sent-2',
      channel: 'chat',
      customer: 'Delta Group',
      sentiment: 'negative',
      text: 'We are still waiting for the integration. It is taking too long.',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      employeeId: 'emp-1',
      employeeName: 'Ivan Petrenko',
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
      employeeName: 'Olena Kovalenko',
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
      title: 'Best time to contact',
      description:
        'NovaCom responds between 10:00-12:00, recommended to schedule a call on Wednesday.',
      type: 'action',
      confidence: 0.86
    },
    {
      id: randomUUID(),
      title: 'Next step for Delta Group',
      description: 'Offer an implementation workshop to accelerate contract signing.',
      type: 'action',
      confidence: 0.74
    },
    {
      id: randomUUID(),
      title: 'Client churn risk',
      description:
        'Delta Group demonstrates a negative correspondence tone and low activity over the last 2 weeks.',
      type: 'alert',
      confidence: 0.69
    }
  ];

  const hrRecommendations: Recommendation[] = [
    {
      id: randomUUID(),
      title: 'Promotion readiness',
      description: 'Ivan Petrenko: high performance score and 36 months in the company.',
      type: 'insight',
      confidence: 0.81
    },
    {
      id: randomUUID(),
      title: 'Attrition risk',
      description:
        'Olena Kovalenko: engagement drop (-9% last month), recommended to hold a meeting.',
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
        { date: 'Week 1', score: 0.68 },
        { date: 'Week 2', score: 0.71 },
        { date: 'Week 3', score: 0.64 },
        { date: 'Week 4', score: 0.76 }
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
          employeeName: 'Ivan Petrenko',
          matchScore: 0.87,
          recommendedRole: 'Regional Sales Manager',
          skillGaps: ['Strategic planning']
        },
        {
          employeeId: 'emp-2',
          employeeName: 'Olena Kovalenko',
          matchScore: 0.74,
          recommendedRole: 'Tech Lead',
          skillGaps: ['Team management', 'Customer communication']
        }
      ]
    },
    communications: {
      inbox: [
        {
          id: randomUUID(),
          category: 'Billing',
          priority: 'urgent',
          summary: 'Client NovaCom is awaiting confirmation of invoice #INV-2045 payment.',
          suggestedActions: ['Check bank payment', 'Send confirmation to client']
        },
        {
          id: randomUUID(),
          category: 'Support',
          priority: 'normal',
          summary: 'Delta Group needs an update regarding CRM integration.',
          suggestedActions: ['Align ETA with technical team', 'Prepare email update']
        }
      ],
      autoReplies: [
        {
          id: randomUUID(),
          title: 'Delay response template',
          description:
            'Thank you for reaching out! We are working on the integration and will provide an update within 24 hours.',
          type: 'action',
          confidence: 0.77
        },
        {
          id: randomUUID(),
          title: 'Invoice reconciliation phrasing',
          description:
            'Invoice #INV-2045 is being processed by the finance department. Confirmation will be sent after reconciliation.',
          type: 'insight',
          confidence: 0.7
        }
      ]
    },
    accounting: {
      expenses: [
        {
          id: randomUUID(),
          statement: 'Logistics expenses increased by 8% due to seasonal demand.',
          category: 'Logistics',
          delta: 0.08,
          unit: 'ratio'
        },
        {
          id: randomUUID(),
          statement: 'Infrastructure spending level stabilized after optimization.',
          category: 'Infrastructure',
          delta: 0.18,
          unit: 'ratio'
        },
        {
          id: randomUUID(),
          statement: 'Compared to last month, marketing expenses decreased by 12%',
          category: 'Marketing',
          delta: -0.12,
          unit: 'ratio'
        }
      ],
      anomalies: [
        {
          id: randomUUID(),
          title: 'Potential duplicate invoice',
          description: 'Invoice #INV-2045 ($4,200) duplicates transaction from May 12, 2024',
          type: 'alert',
          confidence: 0.62
        },
        {
          id: randomUUID(),
          title: 'Budget overrun',
          description:
            'R&D expenses are 14% above plan. Recommended to review equipment purchases.',
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
        { id: 'metric-4', label: 'Cash Runway', value: '8.5 months', change: -0.5 }
      ],
      insights: [
        {
          id: randomUUID(),
          category: 'crm',
          severity: 'warning',
          message:
            'Sales are lagging behind forecast by 8%. Focus on 3 deals in the Negotiation stage.'
        },
        {
          id: randomUUID(),
          category: 'hr',
          severity: 'info',
          message:
            'Turnover risk in the support department +6%. Recommended to schedule 1-on-1s.'
        },
        {
          id: randomUUID(),
          category: 'finance',
          severity: 'critical',
          message: 'Runway 8.5 months. Consider optimizing marketing budget (-10%).'
        }
      ],
      healthScore: 82
    }
  };
};
