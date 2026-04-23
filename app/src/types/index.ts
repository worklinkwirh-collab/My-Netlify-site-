export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  status: 'Active' | 'Frozen' | 'Pending';
  address: string;
  city: string;
  state: string;
  zip: string;
  pin: string;
  avatar?: string;
  accounts: {
    checking: number;
    savings: number;
    crypto: number;
    loan: number;
    loanAvailable: number;
  };
  cards: VirtualCard[];
  transactions: Transaction[];
  portfolio: PortfolioItem[];
  createdAt: string;
}

export interface VirtualCard {
  id: string;
  number: string;
  expiry: string;
  cvv: string;
  type: 'Visa' | 'Mastercard';
  frozen: boolean;
  label: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'completed' | 'pending' | 'failed';
  fromAccount?: string;
  toAccount?: string;
  transferType?: 'local' | 'domestic' | 'international' | 'crypto';
}

export interface PortfolioItem {
  id: string;
  name: string;
  symbol: string;
  type: 'crypto' | 'stock' | 'bond' | 'etf';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
}

export interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  term: number;
  purpose: string;
  status: 'pending' | 'approved' | 'denied';
  appliedAt: string;
  eligibilityScore: number;
}

export interface AuthSession {
  role: 'admin' | 'user';
  userId?: string;
  email: string;
  token: string;
  expiresAt: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}
