import type { User, Transaction, LoanApplication, AuthSession, CryptoPrice } from '@/types';

const STORAGE_KEYS = {
  USERS: 'atlasledger_users',
  SESSION: 'atlasledger_session',
  LOANS: 'atlasledger_loans',
  CRYPTO_PRICES: 'atlasledger_crypto',
  TRANSFER_QUEUE: 'atlasledger_transfers',
  INIT: 'atlasledger_initialized',
};

const DEFAULT_USER: User = {
  id: 'usr_001',
  firstName: 'Turley',
  lastName: 'Edward',
  email: 'joshuaturley59@gmail.com',
  phone: '4062820172',
  dob: '09-08-1989',
  status: 'Active',
  address: '1651 SE LAVA DR APT 84',
  city: 'MILWAUKIE',
  state: 'OR',
  zip: '97222',
  pin: '1234',
  accounts: {
    checking: 43432.93,
    savings: 543323.98,
    crypto: 12833,
    loan: -3203,
    loanAvailable: 100,
  },
  cards: [
    {
      id: 'card_001',
      number: '4532 8901 2345 6789',
      expiry: '09/28',
      cvv: '842',
      type: 'Visa',
      frozen: false,
      label: 'Business Debit',
    },
    {
      id: 'card_002',
      number: '5425 2300 8912 3456',
      expiry: '12/27',
      cvv: '317',
      type: 'Mastercard',
      frozen: false,
      label: 'Business Credit',
    },
  ],
  transactions: [
    {
      id: 'tx_001',
      date: '2026-04-18T10:30:00',
      description: 'Wire Transfer - International',
      category: 'Transfer',
      amount: -5250.0,
      type: 'debit',
      status: 'completed',
      transferType: 'international',
    },
    {
      id: 'tx_002',
      date: '2026-04-17T14:22:00',
      description: 'Invoice Payment - Apex Solutions LLC',
      category: 'Business Income',
      amount: 18500.0,
      type: 'credit',
      status: 'completed',
    },
    {
      id: 'tx_003',
      date: '2026-04-16T09:15:00',
      description: 'AWS Cloud Services',
      category: 'Technology',
      amount: -1247.5,
      type: 'debit',
      status: 'completed',
    },
    {
      id: 'tx_004',
      date: '2026-04-15T16:45:00',
      description: 'Loan Repayment',
      category: 'Loan',
      amount: -890.0,
      type: 'debit',
      status: 'completed',
    },
    {
      id: 'tx_005',
      date: '2026-04-14T11:00:00',
      description: 'BTC Purchase',
      category: 'Crypto',
      amount: -3200.0,
      type: 'debit',
      status: 'completed',
    },
    {
      id: 'tx_006',
      date: '2026-04-13T08:30:00',
      description: 'Quarterly Dividend - Tech Fund',
      category: 'Investment',
      amount: 4200.0,
      type: 'credit',
      status: 'completed',
    },
    {
      id: 'tx_007',
      date: '2026-04-12T13:20:00',
      description: 'Office Rent - April',
      category: 'Real Estate',
      amount: -4850.0,
      type: 'debit',
      status: 'completed',
    },
    {
      id: 'tx_008',
      date: '2026-04-11T15:10:00',
      description: 'Client Deposit - Meridian Corp',
      category: 'Business Income',
      amount: 28500.0,
      type: 'credit',
      status: 'completed',
    },
    {
      id: 'tx_009',
      date: '2026-04-10T10:00:00',
      description: 'Payroll Processing',
      category: 'HR',
      amount: -32000.0,
      type: 'debit',
      status: 'completed',
    },
    {
      id: 'tx_010',
      date: '2026-04-09T09:45:00',
      description: 'Wire Transfer - Domestic',
      category: 'Transfer',
      amount: -7800.0,
      type: 'debit',
      status: 'completed',
    },
  ],
  portfolio: [
    { id: 'pf_001', name: 'Bitcoin', symbol: 'BTC', type: 'crypto', quantity: 4.85, avgPrice: 58200, currentPrice: 94500, value: 458325 },
    { id: 'pf_002', name: 'Ethereum', symbol: 'ETH', type: 'crypto', quantity: 22.4, avgPrice: 3200, currentPrice: 3450, value: 77280 },
    { id: 'pf_003', name: 'S&P 500 ETF', symbol: 'SPY', type: 'etf', quantity: 150, avgPrice: 485, currentPrice: 520, value: 78000 },
    { id: 'pf_004', name: 'US Treasury Bond', symbol: 'GOVT', type: 'bond', quantity: 500, avgPrice: 24.5, currentPrice: 25.8, value: 12900 },
  ],
  createdAt: '2025-01-15T00:00:00',
};

export function initializeStore(): void {
  if (localStorage.getItem(STORAGE_KEYS.INIT)) return;

  const users: User[] = [DEFAULT_USER];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  const loans: LoanApplication[] = [
    {
      id: 'loan_001',
      userId: 'usr_001',
      amount: 50000,
      term: 36,
      purpose: 'Business Expansion',
      status: 'approved',
      appliedAt: '2026-03-01T00:00:00',
      eligibilityScore: 87,
    },
  ];
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));

  const cryptoPrices: CryptoPrice[] = [
    { symbol: 'BTC', name: 'Bitcoin', price: 94500.0, change24h: 2.34 },
    { symbol: 'ETH', name: 'Ethereum', price: 3450.0, change24h: -0.87 },
    { symbol: 'SOL', name: 'Solana', price: 148.5, change24h: 5.12 },
    { symbol: 'ADA', name: 'Cardano', price: 0.72, change24h: -1.23 },
  ];
  localStorage.setItem(STORAGE_KEYS.CRYPTO_PRICES, JSON.stringify(cryptoPrices));

  localStorage.setItem(STORAGE_KEYS.TRANSFER_QUEUE, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.INIT, 'true');
}

export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function updateUser(user: User): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}

export function addUser(user: User): boolean {
  const users = getUsers();
  if (users.length >= 10) return false;
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return true;
}

export function getSession(): AuthSession | null {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!data) return null;
  const session: AuthSession = JSON.parse(data);
  if (session.expiresAt < Date.now()) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return null;
  }
  return session;
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function getLoans(): LoanApplication[] {
  const data = localStorage.getItem(STORAGE_KEYS.LOANS);
  return data ? JSON.parse(data) : [];
}

export function addLoan(loan: LoanApplication): void {
  const loans = getLoans();
  loans.push(loan);
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
}

export function updateLoan(loan: LoanApplication): void {
  const loans = getLoans();
  const idx = loans.findIndex((l) => l.id === loan.id);
  if (idx >= 0) {
    loans[idx] = loan;
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }
}

export function getCryptoPrices(): CryptoPrice[] {
  const data = localStorage.getItem(STORAGE_KEYS.CRYPTO_PRICES);
  return data ? JSON.parse(data) : [];
}

export function updateCryptoPrices(prices: CryptoPrice[]): void {
  localStorage.setItem(STORAGE_KEYS.CRYPTO_PRICES, JSON.stringify(prices));
}

export function addTransaction(userId: string, tx: Transaction): void {
  const user = getUserById(userId);
  if (user) {
    user.transactions.unshift(tx);
    updateUser(user);
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
}

export function simulateCryptoFluctuation(): void {
  const prices = getCryptoPrices();
  const updated = prices.map((p) => {
    const change = (Math.random() - 0.5) * 0.02;
    return {
      ...p,
      price: Math.max(0.01, p.price * (1 + change)),
      change24h: p.change24h + (Math.random() - 0.5) * 0.5,
    };
  });
  updateCryptoPrices(updated);
}

export function calculateLoanEligibility(user: User): number {
  const totalBalance = user.accounts.checking + user.accounts.savings;
  const txCount = user.transactions.length;
  const hasLoan = user.accounts.loan < 0;
  let score = 50;
  score += Math.min(30, totalBalance / 10000);
  score += Math.min(10, txCount / 5);
  if (hasLoan) score -= 10;
  if (user.status === 'Active') score += 10;
  return Math.min(100, Math.max(0, Math.round(score)));
}
