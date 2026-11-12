import { FC } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import type { Transaction, BudgetCategory } from '@/exhibit/types/wallet';
import { formatCurrency } from '@/exhibit/lib/wallet/format';

interface SpendingByCategory {
  name: string;
  value: number;
  color: string;
}

interface SpendingOverTime {
  date: string;
  income: number;
  expense: number;
}

interface IncomeVsExpense {
  name: string;
  amount: number;
}

interface SpendingChartProps {
  transactions: Transaction[];
  budgetCategories: BudgetCategory[];
  type: 'category' | 'timeline' | 'comparison';
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Drink': '#1a93e0',
  Transport: '#15c783',
  Shopping: '#e0aaff',
  Utilities: '#31c4f2',
  Entertainment: '#3dd68c',
  Income: '#3dd68c',
  Transfer: '#94a3b8',
};

const SpendingChart: FC<SpendingChartProps> = ({
  transactions,
  budgetCategories,
  type,
}) => {
  console.log('[SpendingChart] render', { type, count: transactions.length });

  if (type === 'category') {
    const spendingByCategory: SpendingByCategory[] = budgetCategories.map(
      (cat) => ({
        name: cat.name,
        value: cat.spent,
        color: CATEGORY_COLORS[cat.name] ?? '#94a3b8',
      })
    );

    const totalSpent = spendingByCategory.reduce((sum, c) => sum + c.value, 0);

    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h3 className="card-title text-lg">Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value">
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {spendingByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1 text-sm">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.name}</span>
                <span className="opacity-60">
                  ({Math.round((cat.value / totalSpent) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'timeline') {
    const dailyData: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((tx) => {
      const day = tx.date.split('T')[0];
      if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0 };
      if (tx.type === 'income') dailyData[day].income += tx.amount;
      else if (tx.type === 'expense')
        dailyData[day].expense += Math.abs(tx.amount);
    });

    const timelineData: SpendingOverTime[] = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        income: data.income,
        expense: data.expense,
      }));

    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h3 className="card-title text-lg">Spending Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#3dd68c"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f87272"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'comparison') {
    const totalIncome = transactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const comparisonData: IncomeVsExpense[] = [
      { name: 'Income', amount: totalIncome },
      { name: 'Expense', amount: totalExpense },
    ];

    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h3 className="card-title text-lg">Income vs Expense</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === 'Income' ? '#3dd68c' : '#f87272'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SpendingChart;
