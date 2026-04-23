import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Eye,
  EyeOff,
  Snowflake,
  Copy,
  CheckCircle,
  Unlock,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import { getUserById, getSession, updateUser } from '@/lib/store';
import type { User } from '@/types';

export default function Cards() {
  const navigate = useNavigate();
  const { addToast, toasts, removeToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [showCardDetails, setShowCardDetails] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const toggleCardVisibility = (cardId: string) => {
    setShowCardDetails((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const toggleFreeze = (cardId: string) => {
    const updated = { ...user };
    const card = updated.cards.find((c) => c.id === cardId);
    if (card) {
      card.frozen = !card.frozen;
      updateUser(updated);
      setUser(updated);
      addToast(card.frozen ? 'Card frozen' : 'Card unfrozen', 'info');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopiedField(field);
    addToast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const maskNumber = (num: string) => {
    const parts = num.split(' ');
    return `**** **** **** ${parts[3]}`;
  };

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-6 h-6 text-[#001845]" />
        <h1 className="text-2xl font-semibold text-[#001845]">Virtual Cards</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {user.cards.map((card) => (
          <div key={card.id}>
            {/* Card Visual */}
            <div
              className={`relative p-8 aspect-[1.586/1] flex flex-col justify-between ${
                card.frozen ? 'bg-[#5C677D]' : 'bg-gradient-to-br from-[#001233] to-[#001845]'
              } transition-colors`}
            >
              {/* Card Chip */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-gradient-to-r from-amber-300 to-amber-500 rounded" />
                  <div className="w-6 h-4 border border-white/30 rounded-sm" />
                </div>
                <span className="text-white/60 text-xs font-medium">{card.type.toUpperCase()}</span>
              </div>

              {/* Card Number */}
              <div>
                <p className="text-white/40 text-xs mb-1">Card Number</p>
                <p className="text-white text-xl font-mono tracking-[0.15em]">
                  {showCardDetails[card.id] ? card.number : maskNumber(card.number)}
                </p>
              </div>

              {/* Card Details */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/40 text-xs mb-1">Card Holder</p>
                  <p className="text-white text-sm uppercase tracking-wider">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Expires</p>
                    <p className="text-white text-sm font-mono">
                      {showCardDetails[card.id] ? card.expiry : '**/**'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">CVV</p>
                    <p className="text-white text-sm font-mono">
                      {showCardDetails[card.id] ? card.cvv : '***'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Frozen Overlay */}
              {card.frozen && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white">
                    <Snowflake className="w-8 h-8" />
                    <span className="text-lg font-semibold">FROZEN</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="bg-white p-4 border border-t-0 border-[#DEE2E6]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[#001845]">{card.label}</p>
                  <p className="text-xs text-[#8D99AE]">{card.type} · {maskNumber(card.number)}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 ${
                    card.frozen
                      ? 'bg-[#5C677D]/10 text-[#5C677D]'
                      : 'bg-[#2A9D8F]/10 text-[#2A9D8F]'
                  }`}
                >
                  {card.frozen ? 'Frozen' : 'Active'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleCardVisibility(card.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-[#F8F9FA] text-[#5C677D] text-xs hover:text-[#001845] transition-colors"
                >
                  {showCardDetails[card.id] ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  {showCardDetails[card.id] ? 'Hide' : 'Show'}
                </button>

                <button
                  onClick={() => copyToClipboard(card.number, `num_${card.id}`)}
                  className="flex items-center gap-1 px-3 py-2 bg-[#F8F9FA] text-[#5C677D] text-xs hover:text-[#001845] transition-colors"
                >
                  {copiedField === `num_${card.id}` ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  Copy
                </button>

                <button
                  onClick={() => toggleFreeze(card.id)}
                  className={`flex items-center gap-1 px-3 py-2 text-xs transition-colors ml-auto ${
                    card.frozen
                      ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] hover:bg-[#2A9D8F]/20'
                      : 'bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946]/20'
                  }`}
                >
                  {card.frozen ? (
                    <Unlock className="w-3 h-3" />
                  ) : (
                    <Snowflake className="w-3 h-3" />
                  )}
                  {card.frozen ? 'Unfreeze' : 'Freeze'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
