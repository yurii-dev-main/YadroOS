import {
  calculateBonusBreakdown,
  calculateDealProbability,
  calculateLeadScore,
  calculatePerformanceScore
} from '../utils/scoring.utils';
import { buildForecastScenario, smoothTrend } from '../utils/predictions.utils';
import type {
  BonusBreakdown,
  DealProbabilityResult,
  DealProfile,
  ForecastScenario,
  LeadProfile,
  LeadScoreResult,
  PerformanceMetric,
  PerformanceScoreResult
} from '../types/ai.types';

export const scoreLeads = (leads: LeadProfile[]): LeadScoreResult[] => leads.map(calculateLeadScore);

export const evaluateDealProbabilities = (deals: DealProfile[]): DealProbabilityResult[] =>
  deals.map(calculateDealProbability);

export const scorePerformance = (metrics: PerformanceMetric[]): PerformanceScoreResult[] =>
  metrics.map(calculatePerformanceScore);

export const buildBonusModels = (
  metrics: PerformanceMetric[],
  baseSalaries: Record<string, number>,
  companyModifier: number
): BonusBreakdown[] =>
  metrics.map((metric) =>
    calculateBonusBreakdown(metric, baseSalaries[metric.employeeId] ?? 3200, companyModifier)
  );

export const forecastCashFlow = (historical: number[], horizon = 6): ForecastScenario => {
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
