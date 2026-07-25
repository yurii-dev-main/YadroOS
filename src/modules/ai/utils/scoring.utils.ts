import type {
  BonusBreakdown,
  DealProbabilityResult,
  DealProfile,
  LeadProfile,
  LeadScoreResult,
  PerformanceMetric,
  PerformanceScoreResult
} from '../types/ai.types';

const INDUSTRY_WEIGHTS: Record<string, number> = {
  technology: 1.1,
  finance: 1.05,
  healthcare: 1.08,
  manufacturing: 0.95,
  retail: 0.9,
  other: 1
};

export const calculateLeadScore = (lead: LeadProfile): LeadScoreResult => {
  const industryWeight = INDUSTRY_WEIGHTS[lead.industry.toLowerCase()] ?? INDUSTRY_WEIGHTS.other;
  const sizeScore = Math.min(lead.companySize / 200, 1) * 25;
  const engagementScore = Math.min(lead.engagement / 100, 1) * 35;
  const budgetScore = Math.min(lead.budget / 100000, 1) * 25;
  const industryScore = industryWeight * 15;

  const rawScore = sizeScore + engagementScore + budgetScore + industryScore;
  const score = Math.round(Math.min(rawScore, 100));

  const explanation = `Company in ${lead.industry} segment with a budget of ${lead.budget.toLocaleString()} USD and an engagement level of ${lead.engagement}%`;

  return {
    lead,
    score,
    factors: [
      { label: 'Company Size', value: Math.round(sizeScore) },
      { label: 'Engagement', value: Math.round(engagementScore) },
      { label: 'Budget', value: Math.round(budgetScore) },
      { label: 'Industry', value: Math.round(industryScore) }
    ],
    explanation
  };
};

export const calculateDealProbability = (deal: DealProfile): DealProbabilityResult => {
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
    { label: 'Deal Stage', impact: Math.round(stageWeight * 100) },
    { label: 'Days in Stage', impact: Math.round(timePenalty * 100) },
    { label: 'Team Activity', impact: Math.round(activityBoost * 100) },
    { label: 'Deal Value', impact: Math.round(valueInfluence * 100) }
  ];

  const recommendations = [
    probability < 60 && 'Schedule a meeting with the economic buyer',
    deal.daysInStage > 20 && 'Update next steps to avoid stagnation',
    deal.activityScore < 60 && 'Engage marketing to support the deal'
  ].filter(Boolean) as string[];

  return {
    deal,
    probability,
    drivers,
    recommendations: recommendations.length
      ? recommendations
      : ['Maintain current interaction pace for a successful close']
  };
};

export const calculatePerformanceScore = (metric: PerformanceMetric): PerformanceScoreResult => {
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
    metric.kpiScore > 85 && 'Exceeding KPI',
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

export const calculateBonusBreakdown = (
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
    { label: 'Manager Rating', weight: weights.manager, value: metric.managerRating },
    { label: 'Peer Reviews', weight: weights.peer, value: metric.peerReviews }
  ];

  if (weights.client > 0) {
    components.push({
      label: 'Client Feedback',
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
