import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

const colors = ['#6366f1', '#22c55e', '#f97316', '#a855f7', '#14b8a6', '#f43f5e'];

interface TrendPoint {
  month: string;
  income: number;
  expense: number;
}

interface CategoryPoint {
  name: string;
  value: number;
}

interface CashFlowPoint {
  name: string;
  inflow: number;
  outflow: number;
}

interface ForecastPoint {
  month: string;
  expectedIncome: number;
  expectedExpense: number;
}

interface ReportsDashboardProps {
  trend: TrendPoint[];
  categories: CategoryPoint[];
  cashFlow: CashFlowPoint[];
  forecast: ForecastPoint[];
}

export const ReportsDashboard = ({ trend, categories, cashFlow, forecast }: ReportsDashboardProps) => (
  <div className="grid gap-6 xl:grid-cols-2">
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h4 className="text-sm font-semibold text-slate-100">Income and Expense Trends</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#f97316" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h4 className="text-sm font-semibold text-slate-100">Expense Structure</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categories} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40}>
              {categories.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h4 className="text-sm font-semibold text-slate-100">Cash Flow</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cashFlow}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
            <Legend />
            <Bar dataKey="inflow" fill="#22c55e" name="Inflow" />
            <Bar dataKey="outflow" fill="#f43f5e" name="Outflow" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h4 className="text-sm font-semibold text-slate-100">Forecast</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
            <Legend />
            <Line type="monotone" dataKey="expectedIncome" stroke="#38bdf8" strokeWidth={2} name="Expected Income" />
            <Line type="monotone" dataKey="expectedExpense" stroke="#f97316" strokeWidth={2} name="Expected Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);
