import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import {
  getUserById,
  getSession,
  getCryptoPrices,
  simulateCryptoFluctuation,
  generateId,
  addTransaction,
  updateUser,
} from '@/lib/store';
import type { User, Transaction } from '@/types';

export default function Crypto() {
  const navigate = useNavigate();
  const { addToast, toasts, removeToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'prices' | 'wallet'>('prices');

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'user') {
      navigate('/');
      return;
    }
    const u = getUserById(session.userId!);
    if (u) setUser(u);

    const interval = setInterval(() => {
      simulateCryptoFluctuation();
    }, 15000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (!user) return null;

  const prices = getCryptoPrices();

  const handleSimulateBuy = (symbol: string, price: number) => {
    const amount = 1000;
    if (user.accounts.checking < amount) {
      addToast('Insufficient checking balance', 'error');
      return;
    }

    const updated = { ...user };
    updated.accounts.checking -= amount;
    updated.accounts.crypto += amount;

    const tx: Transaction = {
      id: generateId('tx'),
      date: new Date().toISOString(),
      description: `Purchased ${symbol} @ $${price.toLocaleString()}`,
      category: 'Crypto',
      amount: -amount,
      type: 'debit',
      status: 'completed',
    };

    addTransaction(user.id, tx);
    updated.transactions = [tx, ...updated.transactions];
    updateUser(updated);
    setUser(updated);
    addToast(`Purchased $${amount} of ${symbol}`, 'success');
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bitcoin className="w-6 h-6 text-[#001845]" />
          <h1 className="text-2xl font-semibold text-[#001845]">Crypto Services</h1>
        </div>
        <button
          onClick={() => {
            simulateCryptoFluctuation();
            addToast('Prices refreshed', 'info');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DEE2E6] text-[#5C677D] text-sm hover:text-[#001845] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Wallet Summary */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 border-t-2 border-[#001845]">
          <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
            Crypto Wallet Balance
          </p>
          <p className="text-2xl font-semibold text-[#001845]">
            {formatCurrency(user.accounts.crypto)}
          </p>
        </div>
        <div className="bg-white p-6 border-t-2 border-[#2A9D8F]">
          <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
            Available to Buy
          </p>
          <p className="text-2xl font-semibold text-[#2A9D8F]">
            {formatCurrency(user.accounts.checking)}
          </p>
        </div>
        <div className="bg-white p-6 border-t-2 border-[#3A86FF]">
          <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
            Portfolio Value
          </p>
          <p className="text-2xl font-semibold text-[#3A86FF]">
            {formatCurrency(user.portfolio.reduce((sum, p) => sum + p.value, 0))}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DEE2E6] mb-6">
        <button
          onClick={() => setActiveTab('prices')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'prices'
              ? 'border-[#001845] text-[#001845]'
              : 'border-transparent text-[#8D99AE] hover:text-[#5C677D]'
          }`}
        >
          Live Prices
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'wallet'
              ? 'border-[#001845] text-[#001845]'
              : 'border-transparent text-[#8D99AE] hover:text-[#5C677D]'
          }`}
        >
          My Portfolio
        </button>
      </div>

      {activeTab === 'prices' ? (
        <div className="bg-white border-t-2 border-[#001845]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F9FA]">
                  <th className="text-left px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Asset
                  </th>
                  <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Price
                  </th>
                  <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    24h Change
                  </th>
                  <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {prices.map((crypto) => (
                  <tr
                    key={crypto.symbol}
                    className="border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#EDF2FB] flex items-center justify-center">
                          <span className="text-sm font-bold text-[#001845]">
                            {crypto.symbol[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#001845]">
                            {crypto.name}
                          </p>
                          <p className="text-xs text-[#8D99AE]">{crypto.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-mono font-medium text-[#001845]">
                        ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm flex items-center justify-end gap-1 ${
                          crypto.change24h >= 0 ? 'text-[#2A9D8F]' : 'text-[#E63946]'
                        }`}
                      >
                        {crypto.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {crypto.change24h >= 0 ? '+' : ''}
                        {crypto.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSimulateBuy(crypto.symbol, crypto.price)}
                        className="px-4 py-2 bg-[#001233] text-white text-xs hover:bg-[#001845] transition-colors"
                      >
                        Buy $1,000
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border-t-2 border-[#001845]">
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
                    Avg Price
                  </th>
                  <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Current
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
                        <p className="text-xs text-[#8D99AE]">{item.symbol}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-[#001845]">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-[#5C677D]">
                        ${item.avgPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-[#001845]">
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
      )}
    </Layout>
  );
}
