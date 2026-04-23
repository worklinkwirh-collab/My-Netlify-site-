import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PiggyBank,
  Bitcoin,
  Landmark,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import { getUserById, getCryptoPrices, simulateCryptoFluctuation, getSession } from '@/lib/store';
import type { User } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();
  const [hideBalances, setHideBalances] = useState(false);
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

  useEffect(() => {
    const interval = setInterval(() => {
      simulateCryptoFluctuation();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const formatCurrency = (amount: number) => {
    if (hideBalances) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalBalance =
    user.accounts.checking + user.accounts.savings + user.accounts.crypto;
  const recentTransactions = user.transactions.slice(0, 8);
  const cryptoPrices = getCryptoPrices();

  const balanceCards = [
    {
      label: 'TOTAL BALANCE',
      value: formatCurrency(totalBalance),
      change: '+2.4%',
      positive: true,
      icon: Wallet,
    },
    {
      label: 'CHECKING ACCOUNT',
      value: formatCurrency(user.accounts.checking),
      change: '+1.2%',
      positive: true,
      icon: Wallet,
    },
    {
      label: 'SAVINGS ACCOUNT',
      value: formatCurrency(user.accounts.savings),
      change: '+3.1%',
      positive: true,
      icon: PiggyBank,
    },
    {
      label: 'CRYPTO WALLET',
      value: formatCurrency(user.accounts.crypto),
      change: '-0.8%',
      positive: false,
      icon: Bitcoin,
    },
    {
      label: 'LOAN BALANCE',
      value: formatCurrency(user.accounts.loan),
      change: 'APR 6.9%',
      positive: undefined,
      icon: Landmark,
    },
  ];

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#001845]">
            Business Dashboard
          </h1>
          <p className="text-sm text-[#5C677D] mt-1">
            Welcome back, {user.firstName} {user.lastName}
          </p>
        </div>
        <button
          onClick={() => setHideBalances(!hideBalances)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DEE2E6] text-[#5C677D] text-sm hover:text-[#001845] transition-colors"
        >
          {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {hideBalances ? 'Show Balances' : 'Hide Balances'}
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {balanceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white p-6 border-t-2 border-[#001845] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#8D99AE] uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon className="w-5 h-5 text-[#8D99AE]" />
              </div>
              <p className="text-2xl font-semibold text-[#001845]">{card.value}</p>
              {card.positive !== undefined && (
                <p
                  className={`text-xs mt-2 ${
                    card.positive ? 'text-[#2A9D8F]' : 'text-[#E63946]'
                  }`}
                >
                  {card.change} this month
                </p>
              )}
              {card.positive === undefined && (
                <p className="text-xs text-[#5C677D] mt-2">{card.change}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white border-t-2 border-[#001845]">
          <div className="flex items-center justify-between p-6 border-b border-[#DEE2E6]">
            <h2 className="text-lg font-semibold text-[#001845]">
              Recent Transactions
            </h2>
            <button
              onClick={() => navigate('/transfer')}
              className="text-sm text-[#3A86FF] hover:text-[#001845] flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F9FA]">
                  <th className="text-left px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Description
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Category
                  </th>
                  <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Amount
                  </th>
                  <th className="text-center px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[#5C677D]">
                      {new Date(tx.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#001845]">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-[#EDF2FB] text-[#5C677D]">
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-medium text-right ${
                        tx.type === 'credit' ? 'text-[#2A9D8F]' : 'text-[#E63946]'
                      }`}
                    >
                      <span className="flex items-center justify-end gap-1">
                        {tx.type === 'credit' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {formatCurrency(Math.abs(tx.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-xs px-2 py-1 ${
                          tx.status === 'completed'
                            ? 'bg-[#2A9D8F]/10 text-[#2A9D8F]'
                            : tx.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-[#E63946]/10 text-[#E63946]'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crypto Prices & Market */}
        <div className="bg-white border-t-2 border-[#001845]">
          <div className="p-6 border-b border-[#DEE2E6]">
            <h2 className="text-lg font-semibold text-[#001845]">
              Market Overview
            </h2>
          </div>
          <div className="divide-y divide-[#DEE2E6]">
            {cryptoPrices.map((crypto) => (
              <div
                key={crypto.symbol}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#F8F9FA] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-[#001845]">
                    {crypto.name}
                  </p>
                  <p className="text-xs text-[#8D99AE]">{crypto.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#001845]">
                    ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p
                    className={`text-xs flex items-center justify-end gap-1 ${
                      crypto.change24h >= 0 ? 'text-[#2A9D8F]' : 'text-[#E63946]'
                    }`}
                  >
                    {crypto.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {crypto.change24h >= 0 ? '+' : ''}
                    {crypto.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-[#DEE2E6]">
            <button
              onClick={() => navigate('/crypto')}
              className="w-full py-2 text-sm text-[#3A86FF] hover:text-[#001845] transition-colors border border-[#DEE2E6] hover:border-[#001845]"
            >
              Open Crypto Trading
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Send Transfer',
            desc: 'Wire funds domestically or internationally',
            path: '/transfer',
            icon: ArrowUpRight,
          },
          {
            label: 'Apply for Loan',
            desc: 'Check eligibility and apply',
            path: '/loans',
            icon: Landmark,
          },
          {
            label: 'View Portfolio',
            desc: 'Track your investments',
            path: '/portfolio',
            icon: TrendingUp,
          },
          {
            label: 'Manage Cards',
            desc: 'Freeze, unfreeze virtual cards',
            path: '/cards',
            icon: Wallet,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="bg-white p-6 border-t-2 border-[#DEE2E6] hover:border-[#001845] hover:shadow-md transition-all text-left group"
            >
              <Icon className="w-6 h-6 text-[#5C677D] group-hover:text-[#001845] transition-colors mb-3" />
              <h3 className="text-sm font-medium text-[#001845]">{action.label}</h3>
              <p className="text-xs text-[#8D99AE] mt-1">{action.desc}</p>
            </button>
          );
        })}
      </div>
    </Layout>
  );
}
