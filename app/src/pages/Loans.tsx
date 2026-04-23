import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import {
  getUserById,
  getSession,
  getLoans,
  calculateLoanEligibility,
  generateId,
  addLoan,
  updateUser,
} from '@/lib/store';
import type { User, LoanApplication } from '@/types';

export default function Loans() {
  const navigate = useNavigate();
  const { addToast, toasts, removeToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('12');
  const [loanPurpose, setLoanPurpose] = useState('');

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'user') {
      navigate('/');
      return;
    }
    const u = getUserById(session.userId!);
    if (u) {
      setUser(u);
      setLoans(getLoans().filter((l) => l.userId === u.id));
    }
  }, [navigate]);

  if (!user) return null;

  const eligibilityScore = calculateLoanEligibility(user);
  const maxLoanAmount = Math.round(eligibilityScore * 500);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loanAmount);

    if (!amount || amount <= 0) {
      addToast('Please enter a valid loan amount', 'error');
      return;
    }
    if (amount > maxLoanAmount) {
      addToast(`Maximum loan amount is ${formatCurrency(maxLoanAmount)}`, 'error');
      return;
    }
    if (!loanPurpose) {
      addToast('Please specify the loan purpose', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const loan: LoanApplication = {
        id: generateId('loan'),
        userId: user.id,
        amount,
        term: parseInt(loanTerm),
        purpose: loanPurpose,
        status: 'approved',
        appliedAt: new Date().toISOString(),
        eligibilityScore,
      };

      addLoan(loan);
      setLoans([loan, ...loans]);

      const updatedUser = { ...user };
      updatedUser.accounts.loanAvailable += amount;
      updateUser(updatedUser);
      setUser(updatedUser);

      setIsSubmitting(false);
      setShowApplyForm(false);
      setLoanAmount('');
      setLoanPurpose('');
      addToast('Loan application approved!', 'success');
    }, 2000);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center gap-3 mb-8">
        <Landmark className="w-6 h-6 text-[#001845]" />
        <h1 className="text-2xl font-semibold text-[#001845]">Business Loans</h1>
      </div>

      {/* Eligibility Card */}
      <div className="bg-white p-8 border-t-2 border-[#001845] mb-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div>
            <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
              Eligibility Score
            </p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-[#001845]">{eligibilityScore}</span>
              <span className="text-lg text-[#8D99AE] mb-1">/100</span>
            </div>
            <div className="mt-3 h-2 bg-[#EDF2FB] overflow-hidden">
              <div
                className={`h-full transition-all ${
                  eligibilityScore >= 70
                    ? 'bg-[#2A9D8F]'
                    : eligibilityScore >= 40
                    ? 'bg-amber-500'
                    : 'bg-[#E63946]'
                }`}
                style={{ width: `${eligibilityScore}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
              Maximum Loan Amount
            </p>
            <p className="text-3xl font-bold text-[#2A9D8F]">
              {formatCurrency(maxLoanAmount)}
            </p>
            <p className="text-xs text-[#5C677D] mt-1">
              Based on your account activity and balances
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8D99AE] uppercase tracking-wider mb-2">
              Current Loan Status
            </p>
            <p className="text-3xl font-bold text-[#001845]">
              {formatCurrency(Math.abs(user.accounts.loan))}
            </p>
            <p className="text-xs text-[#5C677D] mt-1">
              Outstanding balance at 6.9% APR
            </p>
          </div>
        </div>

        {!showApplyForm && (
          <button
            onClick={() => setShowApplyForm(true)}
            className="mt-8 px-8 py-3 bg-[#001233] text-white text-sm font-medium hover:bg-[#001845] transition-colors"
          >
            Apply for New Loan
          </button>
        )}
      </div>

      {/* Application Form */}
      {showApplyForm && (
        <div className="bg-white p-8 border-t-2 border-[#2A9D8F] mb-8">
          <h2 className="text-lg font-semibold text-[#001845] mb-6">
            Loan Application
          </h2>
          <form onSubmit={handleApply} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                Loan Amount (up to {formatCurrency(maxLoanAmount)})
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D99AE]" />
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="0.00"
                  max={maxLoanAmount}
                  className="w-full pl-10 pr-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845] font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                Loan Term
              </label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
              >
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="60">60 months</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#5C677D] uppercase tracking-wider mb-2">
                Purpose
              </label>
              <textarea
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                placeholder="Describe the purpose of this loan..."
                rows={3}
                className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845] resize-none"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-[#2A9D8F]/10 border border-[#2A9D8F]">
              <CheckCircle className="w-4 h-4 text-[#2A9D8F] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#5C677D]">
                Your eligibility score of {eligibilityScore} qualifies you for
                competitive rates. Approval is typically instant for scores above 60.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#001233] text-white text-sm font-medium hover:bg-[#001845] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="px-8 py-3 border border-[#DEE2E6] text-[#5C677D] text-sm hover:text-[#001845] hover:border-[#001845] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loan History */}
      <div className="bg-white border-t-2 border-[#001845]">
        <div className="p-6 border-b border-[#DEE2E6]">
          <h2 className="text-lg font-semibold text-[#001845]">Loan History</h2>
        </div>
        {loans.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-[#DEE2E6] mx-auto mb-4" />
            <p className="text-[#5C677D]">No loan applications yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F9FA]">
                  <th className="text-left px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Purpose
                  </th>
                  <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Amount
                  </th>
                  <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Term
                  </th>
                  <th className="text-center px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[#5C677D]">
                      {new Date(loan.appliedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#001845]">
                      {loan.purpose}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-mono font-medium text-[#001845]">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[#5C677D]">
                      {loan.term} months
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-xs px-2 py-1 ${
                          loan.status === 'approved'
                            ? 'bg-[#2A9D8F]/10 text-[#2A9D8F]'
                            : loan.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-[#E63946]/10 text-[#E63946]'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
