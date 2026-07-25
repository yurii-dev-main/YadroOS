import type { ForecastPoint, ForecastScenario } from '../types/ai.types';

const createConfidenceBand = (value: number, variance: number): [number, number] => {
  const margin = value * variance;
  return [Math.max(value - margin, 0), value + margin];
};

export const buildForecastScenario = (
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

export const smoothTrend = (values: number[]): number[] => {
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
