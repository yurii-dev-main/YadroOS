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

export interface ExpenseRecord {
  id: string;
  description: string;
  amount: number;
  category?: string;
  timestamp: string;
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

export interface AIQueryResult {
  id: string;
  query: string;
  response: string;
  sources: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actions?: Array<{ type: string; params: Record<string, unknown>; result: Record<string, unknown> }>;
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

export interface InsightGroup {
  title: string;
  insights: Recommendation[];
}

export interface PredictionSummary {
  title: string;
  description: string;
  confidence: number;
  forecast: ForecastScenario;
}
