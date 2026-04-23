import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Bitcoin,
  Landmark,
  Briefcase,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { getUserById, getSession, getCryptoPrices } from '@/lib/store';
import type { User } from '@/types';

export default function Portfolio() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

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

  const prices = getCryptoPrices();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Calculate totals by type
  const cryptoItems = user.portfolio.filter((p) => p.type === 'crypto');
  const stockItems = user.portfolio.filter((p) => p.type === 'stock' || p.type === 'etf');
  const bondItems = user.portfolio.filter((p) => p.type === 'bond');

  const cryptoValue = cryptoItems.reduce((sum, p) => {
    const currentPrice = prices.find((pr) => pr.symbol === p.symbol)?.price || p.currentPrice;
    return sum + p.quantity * currentPrice;
  }, 0);
  const stockValue = stockItems.reduce((sum, p) => sum + p.value, 0);
  const bondValue = bondItems.reduce((sum, p) => sum + p.value, 0);
  const savingsValue = user.accounts.savings;
  const checkingValue = user.accounts.checking;

  const totalValue = cryptoValue + stockValue + bondValue + savingsValue + checkingValue;

  const allocation = [
    { label: 'Crypto', value: cryptoValue, color: '#3A86FF', icon: Bitcoin },
    { label: 'Stocks/ETFs', value: stockValue, color: '#2A9D8F', icon: BarChart3 },
    { label: 'Bonds', value: bondValue, color: '#8D99AE', icon: Landmark },
    { label: 'Savings', value: savingsValue, color: '#E63946', icon: DollarSign },
    { label: 'Checking', value: checkingValue, color: '#001845', icon: Briefcase },
  ];

  // Donut chart SVG
  const svgSize = 200;
  const strokeWidth = 30;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = allocation.map((item) => {
    const percent = item.value / totalValue;
    const dashLength = circumference * percent;
    const segment = {
      ...item,
      percent,
      dashArray: `${dashLength} ${circumference - dashLength}`,
      dashOffset: -offset,
    };
    offset += dashLength;
    return segment;
  });

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-6 h-6 text-[#001845]" />
        <h1 className="text-2xl font-semibold text-[#001845]">Investment Portfolio</h1>
      </div>

      {/* Total Value */}
      <div className="bg-white p-8 border-t-2 border-[#001845] mb-8">
        <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
          Total Portfolio Value
        </p>
        <p className="text-4xl font-bold text-[#001845]">{formatCurrency(totalValue)}</p>
        <p className="text-sm text-[#2A9D8F] mt-2 flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          +8.4% all time
        </p>
      </div>

      {/* Allocation & Chart */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Donut Chart */}
        <div className="bg-white p-8 border-t-2 border-[#001845] flex flex-col items-center">
          <h2 className="text-lg font-semibold text-[#001845] mb-6 self-start">
            Asset Allocation
          </h2>
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
              />
            ))}
            <text
              x={svgSize / 2}
              y={svgSize / 2 - 5}
              textAnchor="middle"
              className="text-lg font-bold fill-[#001845]"
              style={{ fontSize: '14px' }}
            >
              {formatCurrency(totalValue)}
            </text>
            <text
              x={svgSize / 2}
              y={svgSize / 2 + 12}
              textAnchor="middle"
              className="fill-[#8D99AE]"
              style={{ fontSize: '10px' }}
            >
              Total Value
            </text>
          </svg>

          <div className="grid grid-cols-2 gap-4 mt-6 w-full">
            {allocation.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <Icon className="w-4 h-4 text-[#8D99AE]" />
                  <div>
                    <p className="text-xs text-[#5C677D]">{item.label}</p>
                    <p className="text-xs font-medium text-[#001845]">
                      {((item.value / totalValue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white p-8 border-t-2 border-[#001845]">
          <h2 className="text-lg font-semibold text-[#001845] mb-6">
            Asset Breakdown
          </h2>
          <div className="space-y-4">
            {allocation.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#001845]">{item.label}</p>
                      <p className="text-xs text-[#8D99AE]">
                        {((item.value / totalValue) * 100).toFixed(1)}% of portfolio
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#001845]">
                    {formatCurrency(item.value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white border-t-2 border-[#001845]">
        <div className="p-6 border-b border-[#DEE2E6]">
          <h2 className="text-lg font-semibold text-[#001845]">Holdings Detail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA]">
                <th className="text-left px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                  Asset
                </th>
                <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                  Quantity
                </th>
                <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                  Price
                </th>
                <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                  Value
                </th>
                <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                  P/L
                </th>
              </tr>
            </thead>
            <tbody>
              {user.portfolio.map((item) => {
                const currentPrice =
                  prices.find((p) => p.symbol === item.symbol)?.price || item.currentPrice;
                const currentValue = item.quantity * currentPrice;
                const costBasis = item.quantity * item.avgPrice;
                const pnl = currentValue - costBasis;
                const pnlPercent = (pnl / costBasis) * 100;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#001845]">{item.name}</p>
                      <p className="text-xs text-[#8D99AE]">
                        {item.symbol} · {item.type.toUpperCase()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-mono text-[#001845]">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-mono text-[#5C677D]">
                      ${currentPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-mono font-medium text-[#001845]">
                      ${currentValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm font-mono ${
                          pnl >= 0 ? 'text-[#2A9D8F]' : 'text-[#E63946]'
                        }`}
                      >
                        {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()} ({pnlPercent.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
