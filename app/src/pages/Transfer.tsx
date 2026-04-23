import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Globe,
  Building2,
  Bitcoin,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import {
  getUserById,
  getSession,
  generateOtp,
  generateId,
  addTransaction,
  updateUser,
} from '@/lib/store';
import type { User, Transaction } from '@/types';

type TransferType = 'local' | 'domestic' | 'international' | 'crypto';
type TransferStep = 'form' | 'otp' | 'pin' | 'success';

export default function Transfer() {
  const navigate = useNavigate();
  const { addToast, toasts, removeToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [transferType, setTransferType] = useState<TransferType>('local');
  const [step, setStep] = useState<TransferStep>('form');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form fields
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoSymbol, setCryptoSymbol] = useState('BTC');

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

  const resetForm = () => {
    setStep('form');
    setOtpInput('');
    setPinInput('');
    setGeneratedOtp('');
    setRecipientName('');
    setRecipientAccount('');
    setRecipientBank('');
    setSwiftCode('');
    setAmount('');
    setMemo('');
    setCryptoAddress('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    if (transferType !== 'crypto' && (!recipientName || !recipientAccount)) {
      addToast('Please fill in all recipient details', 'error');
      return;
    }
    if (transferType === 'crypto' && !cryptoAddress) {
      addToast('Please enter a crypto address', 'error');
      return;
    }

    if (amt > user.accounts.checking && transferType !== 'crypto') {
      addToast('Insufficient checking account balance', 'error');
      return;
    }
    if (transferType === 'crypto' && amt > user.accounts.crypto) {
      addToast('Insufficient crypto wallet balance', 'error');
      return;
    }

    const otp = generateOtp();
    setGeneratedOtp(otp);
    setStep('otp');
    addToast(`Verification code: ${otp}`, 'info');
  };

  const handleOtpVerify = () => {
    if (otpInput !== generatedOtp) {
      addToast('Invalid verification code', 'error');
      return;
    }
    setStep('pin');
  };

  const handlePinVerify = () => {
    if (pinInput !== user.pin) {
      addToast('Invalid PIN code', 'error');
      return;
    }
    processTransfer();
  };

  const processTransfer = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const amt = parseFloat(amount);
      const updatedUser = { ...user };

      if (transferType === 'crypto') {
        updatedUser.accounts.crypto -= amt;
      } else {
        updatedUser.accounts.checking -= amt;
      }

      const tx: Transaction = {
        id: generateId('tx'),
        date: new Date().toISOString(),
        description:
          transferType === 'crypto'
            ? `Crypto Send - ${cryptoSymbol}`
            : transferType === 'international'
            ? `Wire Transfer - International to ${recipientName}`
            : transferType === 'domestic'
            ? `ACH Transfer to ${recipientName}`
            : `Transfer to ${recipientName}`,
        category: 'Transfer',
        amount: -amt,
        type: 'debit',
        status: 'completed',
        transferType,
      };

      addTransaction(user.id, tx);
      updatedUser.transactions = [tx, ...updatedUser.transactions];
      updateUser(updatedUser);
      setUser(updatedUser);

      setIsProcessing(false);
      setStep('success');
      addToast('Transfer completed successfully', 'success');
    }, 2000);
  };



  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Send className="w-6 h-6 text-[#001845]" />
          <h1 className="text-2xl font-semibold text-[#001845]">Transfer Funds</h1>
        </div>

        {step === 'success' ? (
          <div className="bg-white p-12 text-center border-t-2 border-[#2A9D8F]">
            <CheckCircle className="w-16 h-16 text-[#2A9D8F] mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-[#001845] mb-2">
              Transfer Completed
            </h2>
            <p className="text-[#5C677D] mb-2">
              {formatCurrency(parseFloat(amount))} has been sent successfully.
            </p>
            <p className="text-xs text-[#8D99AE] mb-8">
              Transaction ID: {generateId('tx')}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetForm}
                className="px-8 py-3 bg-[#001233] text-white text-sm font-medium hover:bg-[#001845] transition-colors"
              >
                New Transfer
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 border border-[#DEE2E6] text-[#5C677D] text-sm hover:text-[#001845] hover:border-[#001845] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : step === 'otp' ? (
          <div className="bg-white p-8 border-t-2 border-[#001845]">
            <div className="mb-6">
              <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
                Verification Required
              </p>
              <h2 className="text-xl font-semibold text-[#001845]">
                Enter Verification Code
              </h2>
              <p className="text-sm text-[#5C677D] mt-2">
                A 6-digit code was generated for this transaction. Please enter it below.
              </p>
            </div>
            <div className="p-4 bg-[#2A9D8F]/10 border border-[#2A9D8F] mb-6">
              <p className="text-xs text-[#5C677D] uppercase mb-1">Your Code</p>
              <p className="text-3xl font-mono font-bold text-[#001845] tracking-[0.5em]">
                {generatedOtp}
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] font-mono text-lg tracking-[0.3em] text-center focus:outline-none focus:border-[#001845]"
                maxLength={6}
              />
              <button
                onClick={handleOtpVerify}
                className="w-full py-3 bg-[#001233] text-white text-sm font-medium hover:bg-[#001845] transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => setStep('form')}
                className="w-full py-3 text-[#5C677D] text-sm hover:text-[#001845] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : step === 'pin' ? (
          <div className="bg-white p-8 border-t-2 border-[#001845]">
            <div className="mb-6">
              <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
                Security Check
              </p>
              <h2 className="text-xl font-semibold text-[#001845]">
                Enter Transfer PIN
              </h2>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="****"
                className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] font-mono text-lg tracking-[0.3em] text-center focus:outline-none focus:border-[#001845]"
                maxLength={4}
              />
              <button
                onClick={handlePinVerify}
                disabled={isProcessing}
                className="w-full py-3 bg-[#001233] text-white text-sm font-medium hover:bg-[#001845] transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Transfer'}
              </button>
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-[#5C677D] text-sm">
                  <Clock className="w-4 h-4 animate-spin" />
                  Processing your transfer...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border-t-2 border-[#001845]">
            {/* Tabs */}
            <div className="flex border-b border-[#DEE2E6]">
              <button
                onClick={() => setTransferType('local')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  transferType === 'local'
                    ? 'border-[#001845] text-[#001845]'
                    : 'border-transparent text-[#8D99AE] hover:text-[#5C677D]'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" /> Local
              </button>
              <button
                onClick={() => setTransferType('domestic')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  transferType === 'domestic'
                    ? 'border-[#001845] text-[#001845]'
                    : 'border-transparent text-[#8D99AE] hover:text-[#5C677D]'
                }`}
              >
                <Building2 className="w-4 h-4" /> Domestic
              </button>
              <button
                onClick={() => setTransferType('international')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  transferType === 'international'
                    ? 'border-[#001845] text-[#001845]'
                    : 'border-transparent text-[#8D99AE] hover:text-[#5C677D]'
                }`}
              >
                <Globe className="w-4 h-4" /> International
              </button>
              <button
                onClick={() => setTransferType('crypto')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  transferType === 'crypto'
                    ? 'border-[#001845] text-[#001845]'
                    : 'border-transparent text-[#8D99AE] hover:text-[#5C677D]'
                }`}
              >
                <Bitcoin className="w-4 h-4" /> Crypto
              </button>
            </div>

            {/* Balance Info */}
            <div className="flex items-center gap-4 px-6 py-4 bg-[#F8F9FA] border-b border-[#DEE2E6]">
              <div>
                <p className="text-xs text-[#8D99AE] uppercase">
                  Available {transferType === 'crypto' ? 'Crypto' : 'Checking'}
                </p>
                <p className="text-lg font-semibold text-[#001845]">
                  {transferType === 'crypto'
                    ? formatCurrency(user.accounts.crypto)
                    : formatCurrency(user.accounts.checking)}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {transferType === 'crypto' ? (
                <>
                  <div>
                    <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                      Select Asset
                    </label>
                    <select
                      value={cryptoSymbol}
                      onChange={(e) => setCryptoSymbol(e.target.value)}
                      className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="SOL">Solana (SOL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      placeholder="0x... or wallet address"
                      className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845] font-mono"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Full name or business name"
                      className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                      Account / Routing Number
                    </label>
                    <input
                      type="text"
                      value={recipientAccount}
                      onChange={(e) => setRecipientAccount(e.target.value.replace(/\D/g, ''))}
                      placeholder="Account number"
                      className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845] font-mono"
                    />
                  </div>
                  {(transferType === 'domestic' || transferType === 'international') && (
                    <div>
                      <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={recipientBank}
                        onChange={(e) => setRecipientBank(e.target.value)}
                        placeholder="Recipient bank name"
                        className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                      />
                    </div>
                  )}
                  {transferType === 'international' && (
                    <div>
                      <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                        SWIFT / BIC Code
                      </label>
                      <input
                        type="text"
                        value={swiftCode}
                        onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                        placeholder="SWIFT code"
                        className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845] font-mono uppercase"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                    Memo / Reference
                  </label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  {transferType === 'international'
                    ? 'International wires typically take 1-3 business days. Fees may apply.'
                    : transferType === 'crypto'
                    ? 'Crypto transactions are irreversible. Please verify the address carefully.'
                    : 'Transfers are usually processed within 1 business day.'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#001233] text-white text-sm font-medium hover:bg-[#001845] transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Continue to Verification
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
