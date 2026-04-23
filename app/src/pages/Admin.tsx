import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  DollarSign,
  Activity,
  Edit3,
  Save,
  Plus,
  Search,
  CreditCard,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import {
  getUsers,
  getSession,
  getLoans,
  updateUser,
  addUser,
  getUserById,
  generateId,
} from '@/lib/store';
import type { User, LoanApplication } from '@/types';

export default function Admin() {
  const navigate = useNavigate();
  const { addToast, toasts, removeToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit states
  const [editBalances, setEditBalances] = useState(false);
  const [checkingBal, setCheckingBal] = useState('');
  const [savingsBal, setSavingsBal] = useState('');
  const [cryptoBal, setCryptoBal] = useState('');
  const [loanBal, setLoanBal] = useState('');

  // Create form
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'admin') {
      navigate('/');
      return;
    }
    refreshData();
  }, [navigate]);

  const refreshData = () => {
    setUsers(getUsers());
    setLoans(getLoans());
  };

  const selectUser = (u: User) => {
    setSelectedUser(u);
    setEditBalances(false);
    setCheckingBal(u.accounts.checking.toString());
    setSavingsBal(u.accounts.savings.toString());
    setCryptoBal(u.accounts.crypto.toString());
    setLoanBal(u.accounts.loan.toString());
  };

  const saveBalances = () => {
    if (!selectedUser) return;
    const updated = { ...selectedUser };
    updated.accounts.checking = parseFloat(checkingBal) || 0;
    updated.accounts.savings = parseFloat(savingsBal) || 0;
    updated.accounts.crypto = parseFloat(cryptoBal) || 0;
    updated.accounts.loan = parseFloat(loanBal) || 0;
    updateUser(updated);
    setSelectedUser(updated);
    setEditBalances(false);
    refreshData();
    addToast('Account balances updated', 'success');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.length >= 10) {
      addToast('Maximum 10 users allowed', 'error');
      return;
    }

    const newUser: User = {
      id: generateId('usr'),
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      phone: newPhone,
      dob: newDob,
      status: 'Active',
      address: '',
      city: '',
      state: '',
      zip: '',
      pin: newPin || '1234',
      accounts: {
        checking: 0,
        savings: 0,
        crypto: 0,
        loan: 0,
        loanAvailable: 0,
      },
      cards: [],
      transactions: [],
      portfolio: [],
      createdAt: new Date().toISOString(),
    };

    if (addUser(newUser)) {
      addToast('User created successfully', 'success');
      setShowCreateForm(false);
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPhone('');
      setNewDob('');
      setNewPin('');
      refreshData();
    } else {
      addToast('Failed to create user', 'error');
    }
  };

  const toggleUserStatus = (userId: string) => {
    const u = getUserById(userId);
    if (u) {
      const updated = { ...u };
      updated.status = updated.status === 'Active' ? 'Frozen' : 'Active';
      updateUser(updated);
      refreshData();
      if (selectedUser?.id === userId) {
        setSelectedUser(updated);
      }
      addToast(`User ${updated.status === 'Active' ? 'activated' : 'frozen'}`, 'info');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAssets = users.reduce(
    (sum, u) => sum + u.accounts.checking + u.accounts.savings + u.accounts.crypto,
    0
  );

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-6 h-6 text-[#001845]" />
        <h1 className="text-2xl font-semibold text-[#001845]">Control Panel</h1>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 border-t-2 border-[#001845]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8D99AE] uppercase tracking-wider">
              Total Users
            </span>
            <Users className="w-5 h-5 text-[#8D99AE]" />
          </div>
          <p className="text-2xl font-semibold text-[#001845]">{users.length} / 10</p>
        </div>
        <div className="bg-white p-6 border-t-2 border-[#2A9D8F]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8D99AE] uppercase tracking-wider">
              Total Assets
            </span>
            <DollarSign className="w-5 h-5 text-[#8D99AE]" />
          </div>
          <p className="text-2xl font-semibold text-[#2A9D8F]">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="bg-white p-6 border-t-2 border-[#3A86FF]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8D99AE] uppercase tracking-wider">
              Active Loans
            </span>
            <Activity className="w-5 h-5 text-[#8D99AE]" />
          </div>
          <p className="text-2xl font-semibold text-[#3A86FF]">{loans.length}</p>
        </div>
        <div className="bg-white p-6 border-t-2 border-[#E63946]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8D99AE] uppercase tracking-wider">
              Active Users
            </span>
            <Users className="w-5 h-5 text-[#8D99AE]" />
          </div>
          <p className="text-2xl font-semibold text-[#E63946]">
            {users.filter((u) => u.status === 'Active').length}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Create */}
          <div className="bg-white p-6 border-t-2 border-[#001845]">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D99AE]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                />
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#001233] text-white text-sm hover:bg-[#001845] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create User
              </button>
            </div>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="bg-white p-6 border-t-2 border-[#2A9D8F]">
              <h3 className="text-sm font-semibold text-[#001845] mb-4">
                Create New User
              </h3>
              <form onSubmit={handleCreateUser} className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                  className="px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                />
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  placeholder="Last Name"
                  required
                  className="px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                />
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Phone"
                  className="px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                />
                <input
                  type="text"
                  value={newDob}
                  onChange={(e) => setNewDob(e.target.value)}
                  placeholder="DOB (MM-DD-YYYY)"
                  className="px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
                />
                <input
                  type="text"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="PIN (4 digits)"
                  maxLength={4}
                  className="px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845] font-mono"
                />
                <div className="sm:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#001233] text-white text-sm hover:bg-[#001845] transition-colors"
                  >
                    Create User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-[#DEE2E6] text-[#5C677D] text-sm hover:text-[#001845] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white border-t-2 border-[#001845]">
            <div className="p-6 border-b border-[#DEE2E6]">
              <h2 className="text-lg font-semibold text-[#001845]">User Accounts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8F9FA]">
                    <th className="text-left px-4 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                      Email
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                      Balance
                    </th>
                    <th className="text-center px-4 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={`border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors cursor-pointer ${
                        selectedUser?.id === u.id ? 'bg-[#EDF2FB]' : ''
                      }`}
                      onClick={() => selectUser(u)}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[#001845]">
                          {u.firstName} {u.lastName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#5C677D]">{u.email}</td>
                      <td className="px-4 py-3 text-right text-sm font-mono text-[#001845]">
                        {formatCurrency(u.accounts.checking + u.accounts.savings)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-1 ${
                            u.status === 'Active'
                              ? 'bg-[#2A9D8F]/10 text-[#2A9D8F]'
                              : 'bg-[#E63946]/10 text-[#E63946]'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUserStatus(u.id);
                          }}
                          className="text-xs text-[#3A86FF] hover:text-[#001845] transition-colors"
                        >
                          {u.status === 'Active' ? 'Freeze' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected User Detail */}
        <div>
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white p-6 border-t-2 border-[#001845]">
                <h3 className="text-sm font-semibold text-[#001845] mb-4">
                  User Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-[#5C677D]">Name</span>
                    <span className="text-sm text-[#001845]">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#5C677D]">Email</span>
                    <span className="text-sm text-[#001845]">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#5C677D]">Phone</span>
                    <span className="text-sm text-[#001845]">{selectedUser.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#5C677D]">DOB</span>
                    <span className="text-sm text-[#001845]">{selectedUser.dob}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#5C677D]">Status</span>
                    <span
                      className={`text-xs px-2 py-0.5 ${
                        selectedUser.status === 'Active'
                          ? 'bg-[#2A9D8F]/10 text-[#2A9D8F]'
                          : 'bg-[#E63946]/10 text-[#E63946]'
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>
                  {selectedUser.address && (
                    <div className="pt-2 border-t border-[#DEE2E6]">
                      <span className="text-xs text-[#5C677D]">Address</span>
                      <p className="text-sm text-[#001845] mt-1">{selectedUser.address}</p>
                      <p className="text-sm text-[#001845]">
                        {selectedUser.city}, {selectedUser.state} {selectedUser.zip}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Balance Editor */}
              <div className="bg-white p-6 border-t-2 border-[#3A86FF]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#001845]">
                    Account Balances
                  </h3>
                  <button
                    onClick={() => {
                      if (editBalances) {
                        saveBalances();
                      } else {
                        setEditBalances(true);
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-[#3A86FF] hover:text-[#001845]"
                  >
                    {editBalances ? (
                      <>
                        <Save className="w-3 h-3" /> Save
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3 h-3" /> Edit
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Checking', value: checkingBal, setter: setCheckingBal },
                    { label: 'Savings', value: savingsBal, setter: setSavingsBal },
                    { label: 'Crypto', value: cryptoBal, setter: setCryptoBal },
                    { label: 'Loan', value: loanBal, setter: setLoanBal },
                  ].map((field) => (
                    <div key={field.label} className="flex justify-between items-center">
                      <span className="text-xs text-[#5C677D]">{field.label}</span>
                      {editBalances ? (
                        <input
                          type="number"
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          className="w-32 px-2 py-1 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] text-sm text-right font-mono focus:outline-none focus:border-[#001845]"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-sm font-mono text-[#001845]">
                          {formatCurrency(parseFloat(field.value) || 0)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cards */}
              <div className="bg-white p-6 border-t-2 border-[#2A9D8F]">
                <h3 className="text-sm font-semibold text-[#001845] mb-4">
                  Cards ({selectedUser.cards.length})
                </h3>
                {selectedUser.cards.length === 0 ? (
                  <p className="text-xs text-[#8D99AE]">No cards issued</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.cards.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-3 bg-[#F8F9FA]"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#5C677D]" />
                          <span className="text-xs text-[#001845]">{card.label}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 ${
                            card.frozen
                              ? 'bg-[#5C677D]/10 text-[#5C677D]'
                              : 'bg-[#2A9D8F]/10 text-[#2A9D8F]'
                          }`}
                        >
                          {card.frozen ? 'Frozen' : 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transaction Count */}
              <div className="bg-white p-6 border-t-2 border-[#8D99AE]">
                <h3 className="text-sm font-semibold text-[#001845] mb-4">
                  Activity Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-[#5C677D]">Total Transactions</span>
                    <span className="text-sm text-[#001845]">
                      {selectedUser.transactions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#5C677D]">Portfolio Items</span>
                    <span className="text-sm text-[#001845]">
                      {selectedUser.portfolio.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#5C677D]">Member Since</span>
                    <span className="text-sm text-[#001845]">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center border-t-2 border-[#DEE2E6]">
              <Users className="w-12 h-12 text-[#DEE2E6] mx-auto mb-4" />
              <p className="text-[#5C677D]">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Loans Section */}
      <div className="mt-8 bg-white border-t-2 border-[#001845]">
        <div className="p-6 border-b border-[#DEE2E6]">
          <h2 className="text-lg font-semibold text-[#001845]">Loan Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA]">
                <th className="text-left px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                  User
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
                <th className="text-right px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                  Score
                </th>
                <th className="text-center px-6 py-3 text-xs text-[#5C677D] uppercase tracking-wider font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => {
                const loanUser = users.find((u) => u.id === loan.userId);
                return (
                  <tr
                    key={loan.id}
                    className="border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[#001845]">
                      {loanUser ? `${loanUser.firstName} ${loanUser.lastName}` : loan.userId}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5C677D]">{loan.purpose}</td>
                    <td className="px-6 py-4 text-right text-sm font-mono text-[#001845]">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[#5C677D]">
                      {loan.term} months
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[#001845]">
                      {loan.eligibilityScore}/100
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
