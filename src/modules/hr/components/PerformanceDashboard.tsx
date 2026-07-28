import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Employee, KPI, OKR, PerformanceHighlight, PerformanceReview } from '../types/hr.types';
import { getEmployeeName } from '../utils/hr.utils';

interface PerformanceDashboardProps {
  employees: Employee[];
  kpis: KPI[];
  okrs: OKR[];
  reviews: PerformanceReview[];
  highlights: PerformanceHighlight[];
  averageScore: number;
}

export const PerformanceDashboard: FC<PerformanceDashboardProps> = ({
  employees,
  kpis,
  okrs,
  reviews,
  highlights,
  averageScore
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm text-slate-400">Average Evaluation Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-emerald-300">{averageScore.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm text-slate-400">KPIs in Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-primary">{kpis.length}</p>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm text-slate-400">Active OKRs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-amber-300">{okrs.length}</p>
        </CardContent>
      </Card>
    </div>

    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100">KPI</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm font-semibold text-slate-100">{kpi.title}</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">{kpi.role}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Current Value</span>
                <span>
                  {kpi.current} {kpi.unit}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Target: {kpi.target} {kpi.unit}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100">OKR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {okrs.map((okr) => (
          <div key={okr.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm font-semibold text-slate-100">{okr.objective}</p>
            <ul className="mt-2 space-y-2">
              {okr.keyResults.map((kr) => (
                <li key={kr.id} className="text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>{kr.description}</span>
                    <span className="text-xs text-primary">{kr.progress}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{ width: `${kr.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100">Reviews and Evaluations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <p className="text-sm font-semibold text-slate-100">
                {getEmployeeName(employees, review.employeeId)} — {review.period}
              </p>
              <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-xs uppercase tracking-wide text-primary">
                {review.type}
              </span>
            </div>
            <p className="mt-2 text-sm text-emerald-300">Overall score: {review.overallScore}</p>
            <p className="text-xs text-slate-400">Self: {review.selfAssessment}</p>
            <p className="text-xs text-slate-400">Manager: {review.managerAssessment}</p>
            <div className="mt-2">
              <h4 className="text-xs uppercase tracking-wide text-slate-400">Goals</h4>
              <ul className="list-inside list-disc text-xs text-slate-300">
                {review.goalsNextPeriod.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <h4 className="text-xs uppercase tracking-wide text-slate-400">360° Feedback</h4>
              <ul className="list-inside list-disc text-xs text-slate-300">
                {review.feedback360.map((feedback) => (
                  <li key={feedback}>{feedback}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100">Highlights</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {highlights.map((highlight) => (
          <div
            key={highlight.employeeId}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-center"
          >
            <p className="text-sm font-semibold text-emerald-100">
              {getEmployeeName(employees, highlight.employeeId)}
            </p>
            <p className="text-xs uppercase tracking-wide text-emerald-300">{highlight.title}</p>
            <p className="text-2xl font-bold text-emerald-200">{highlight.score}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);
