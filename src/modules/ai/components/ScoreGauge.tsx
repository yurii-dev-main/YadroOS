import { RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  value: number;
  label: string;
  size?: number;
  suffix?: string;
}

export const ScoreGauge = ({ value, label, size = 180, suffix = '%' }: ScoreGaugeProps) => {
  const chartData = [{ name: 'score', value }];

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={18}
            startAngle={225}
            endAngle={-45}
            data={chartData}
          >
            <RadialBar background dataKey="value" cornerRadius={12} fill="#38bdf8" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center">
        <p className="text-3xl font-semibold text-slate-50">
          {value}
          {suffix}
        </p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
};
