export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  timezone: string;
  avatar: string;
  currency: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  accountNumber: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
}

export interface Card {
  id: string;
  name: string;
  number: string;
  expiry: string;
  type: 'visa' | 'mastercard' | 'amex';
  color: string;
  frozen: boolean;
  cardholderName: string;
  spendingLimit: number;
  spentThisMonth: number;
  currency: string;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDue: string;
  paid: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'transaction' | 'alert' | 'promotion' | 'system';
}

export interface BudgetCategory {
  id: string;
  name: string;
  spent: number;
  limit: number;
  color: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
  symbol: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  frequentlyUsed: boolean;
}

export interface PaymentRequest {
  id: string;
  fromContactId: string;
  toContactId: string;
  amount: number;
  currency: string;
  note: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

export interface RecurringTransfer {
  id: string;
  fromAccountId: string;
  toContactId: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDue: string;
  active: boolean;
}

export interface CurrencyAlert {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  direction: 'above' | 'below';
  active: boolean;
}

export interface Loan {
  id: string;
  name: string;
  type: 'personal' | 'auto' | 'home' | 'education';
  principal: number;
  interestRate: number;
  tenureMonths: number;
  emi: number;
  paidEmis: number;
  outstanding: number;
  currency: string;
  startDate: string;
  status: 'active' | 'closed' | 'overdue';
}

export interface FixedDeposit {
  id: string;
  name: string;
  depositAmount: number;
  interestRate: number;
  tenureMonths: number;
  maturityAmount: number;
  currency: string;
  startDate: string;
  maturityDate: string;
  status: 'active' | 'matured' | 'closed';
  autoRenew: boolean;
}

export interface RecurringDeposit {
  id: string;
  name: string;
  monthlyAmount: number;
  interestRate: number;
  tenureMonths: number;
  depositsCompleted: number;
  maturityAmount: number;
  currency: string;
  startDate: string;
  status: 'active' | 'matured' | 'closed';
}

export interface SavingsGoal {
  id: string;
  name: string;
  category: 'vacation' | 'emergency' | 'education' | 'wedding' | 'custom';
  targetAmount: number;
  savedAmount: number;
  currency: string;
  targetDate: string;
  monthlyContribution: number;
  priority: number;
}

export interface Insurance {
  id: string;
  name: string;
  type: 'life' | 'health' | 'auto' | 'home';
  provider: string;
  coverageAmount: number;
  premium: number;
  premiumFrequency: 'monthly' | 'yearly';
  currency: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
}

export interface CardReward {
  id: string;
  cardId: string;
  cashbackThisMonth: number;
  cashbackYtd: number;
  points: number;
  tier: 'standard' | 'gold' | 'platinum' | 'black';
  earnRate: number;
  currency: string;
}
