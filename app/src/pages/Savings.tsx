import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PiggyBank,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { getUserById, getSession } from '@/lib/store';
import type { User } from '@/types';

export default function Savings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [projectionYears, setProjectionYears] = useState(5);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'user') {
      navigate('/');
      return;
    }
    const u = getUserById(session.userId!);
    if (u) setUser(u);
  }, [navigate]);

  if (!user) return null;

  const savingsRate = 4.25;
  const apy = savingsRate;
  const monthlyRate = savingsRate / 100 / 12;
  const currentBalance = user.accounts.savings;
  const monthlyDeposit = 5000;

  // Calculate projection
  const projections = Array.from({ length: projectionYears + 1 }, (_, i) => {
    const months = i * 12;
    const futureValue =
      currentBalance * Math.pow(1 + monthlyRate, months) +
      monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return {
      year: i,
      balance: futureValue,
      interest: futureValue - currentBalance - monthlyDeposit * months,
    };
  });

  const totalInterest = projections[projectionYears].interest;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Generate SVG chart path
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = 40;
  const maxValue = Math.max(...projections.map((p) => p.balance));
  const minValue = Math.min(...projections.map((p) => p.balance));
  const valueRange = maxValue - minValue;

  const points = projections.map((p, i) => ({
    x: padding + (i / projectionYears) * (chartWidth - padding * 2),
    y: chartHeight - padding - ((p.balance - minValue) / valueRange) * (chartHeight - padding * 2),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-8">
        <PiggyBank className="w-6 h-6 text-[#001845]" />
        <h1 className="text-2xl font-semibold text-[#001845]">Savings Account</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 border-t-2 border-[#2A9D8F]">
          <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
            Current Balance
          </p>
          <p className="text-2xl font-semibold text-[#001845]">
            {formatCurrency(currentBalance)}
          </p>
        </div>
        <div className="bg-white p-6 border-t-2 border-[#3A86FF]">
          <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
            APY
          </p>
          <p className="text-2xl font-semibold text-[#3A86FF]">{apy}%</p>
        </div>
        <div className="bg-white p-6 border-t-2 border-[#2A9D8F]">
          <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
            Projected ({projectionYears}Y)
          </p>
          <p className="text-2xl font-semibold text-[#2A9D8F]">
            {formatCurrency(projections[projectionYears].balance)}
          </p>
        </div>
        <div className="bg-white p-6 border-t-2 border-[#001845]">
          <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
            Interest Earned
          </p>
          <p className="text-2xl font-semibold text-[#2A9D8F]">
            {formatCurrency(totalInterest)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-8 border-t-2 border-[#001845] mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#001845]">
            Growth Projection
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5C677D]">Years:</span>
            {[3, 5, 10].map((y) => (
              <button
                key={y}
                onClick={() => setProjectionYears(y)}
                className={`px-3 py-1 text-xs ${
                  projectionYears === y
                    ? 'bg-[#001233] text-white'
                    : 'bg-[#EDF2FB] text-[#5C677D] hover:bg-[#DEE2E6]'
                } transition-colors`}
              >
                {y}Y
              </button>
            ))}
          </div>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: '300px' }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding + (i / 4) * (chartHeight - padding * 2);
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#DEE2E6"
                strokeWidth="1"
              />
            );
          })}

          {/* Area fill */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
            fill="rgba(42, 157, 143, 0.1)"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2A9D8F"
            strokeWidth="2"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#2A9D8F" />
              <text
                x={p.x}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                className="text-xs fill-[#5C677D]"
                style={{ fontSize: '12px' }}
              >
                Year {i}
              </text>
            </g>
          ))}
        </svg>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#2A9D8F]" />
            <span className="text-xs text-[#5C677D]">Total Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#2A9D8F]/20" />
            <span className="text-xs text-[#5C677D]">Interest Growth</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border-t-2 border-[#001845]">
          <h3 className="text-sm font-semibold text-[#001845] mb-4">
            Account Details
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Account Type', value: 'Business Savings' },
              { label: 'Interest Rate', value: `${apy}% APY` },
              { label: 'Compounding', value: 'Monthly' },
              { label: 'Monthly Deposit', value: formatCurrency(monthlyDeposit) },
              { label: 'FDIC Insured', value: 'Yes, up to $250,000' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between py-2 border-b border-[#DEE2E6] last:border-0"
              >
                <span className="text-sm text-[#5C677D]">{item.label}</span>
                <span className="text-sm font-medium text-[#001845]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 border-t-2 border-[#001845]">
          <h3 className="text-sm font-semibold text-[#001845] mb-4">
            Projection Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Starting Balance', value: formatCurrency(currentBalance) },
              {
                label: 'Total Deposits',
                value: formatCurrency(monthlyDeposit * projectionYears * 12),
              },
              { label: 'Interest Earned', value: formatCurrency(totalInterest), highlight: true },
              { label: 'Final Balance', value: formatCurrency(projections[projectionYears].balance), highlight: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between py-2 border-b border-[#DEE2E6] last:border-0"
              >
                <span className="text-sm text-[#5C677D]">{item.label}</span>
                <span
                  className={`text-sm font-medium ${
                    item.highlight ? 'text-[#2A9D8F]' : 'text-[#001845]'
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
