'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { UserProvider, useUserContext } from './entities/UserProvider';
import {
  AccountsProvider,
  useAccountsContext,
} from './entities/AccountsProvider';
import {
  TransactionsProvider,
  useTransactionsContext,
} from './entities/TransactionsProvider';
import { CardsProvider, useCardsContext } from './entities/CardsProvider';
import { BillsProvider, useBillsContext } from './entities/BillsProvider';
import {
  NotificationsProvider,
  useNotificationsContext,
} from './entities/NotificationsProvider';
import { BudgetProvider, useBudgetContext } from './entities/BudgetProvider';
import {
  CurrencyRatesProvider,
  useCurrencyRatesContext,
} from './entities/CurrencyRatesProvider';
import {
  ContactsProvider,
  useContactsContext,
} from './entities/ContactsProvider';
import {
  PaymentRequestsProvider,
  usePaymentRequestsContext,
} from './entities/PaymentRequestsProvider';
import {
  RecurringTransfersProvider,
  useRecurringTransfersContext,
} from './entities/RecurringTransfersProvider';
import {
  CurrencyAlertsProvider,
  useCurrencyAlertsContext,
} from './entities/CurrencyAlertsProvider';
import { LoansProvider, useLoansContext } from './entities/LoansProvider';
import { FDsProvider, useFDsContext } from './entities/FDsProvider';
import { RDsProvider, useRDsContext } from './entities/RDsProvider';
import { GoalsProvider, useGoalsContext } from './entities/GoalsProvider';
import {
  InsuranceProvider,
  useInsuranceContext,
} from './entities/InsuranceProvider';
import { RewardsProvider, useRewardsContext } from './entities/RewardsProvider';
import type {
  User,
  Account,
  Transaction,
  Card,
  RecurringBill,
  Notification,
  BudgetCategory,
  CurrencyRate,
  Contact,
  PaymentRequest,
  RecurringTransfer,
  CurrencyAlert,
  Loan,
  FixedDeposit,
  RecurringDeposit,
  SavingsGoal,
  Insurance,
  CardReward,
} from '@/exhibit/types/wallet';

interface DataContextValue {
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  recurringBills: RecurringBill[];
  notifications: Notification[];
  budgetCategories: BudgetCategory[];
  currencyRates: CurrencyRate[];
  contacts: Contact[];
  paymentRequests: PaymentRequest[];
  recurringTransfers: RecurringTransfer[];
  currencyAlerts: CurrencyAlert[];
  loans: Loan[];
  fixedDeposits: FixedDeposit[];
  recurringDeposits: RecurringDeposit[];
  savingsGoals: SavingsGoal[];
  insurance: Insurance[];
  cardRewards: CardReward[];
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  updateUser: (user: User) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  addAccount: (account: Account) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  addRecurringBill: (bill: RecurringBill) => Promise<void>;
  updateRecurringBill: (bill: RecurringBill) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  updateBudgetCategory: (category: BudgetCategory) => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  updateContact: (contact: Contact) => Promise<void>;
  addPaymentRequest: (request: PaymentRequest) => Promise<void>;
  updatePaymentRequest: (request: PaymentRequest) => Promise<void>;
  addRecurringTransfer: (transfer: RecurringTransfer) => Promise<void>;
  updateRecurringTransfer: (transfer: RecurringTransfer) => Promise<void>;
  addCurrencyAlert: (alert: CurrencyAlert) => Promise<void>;
  updateCurrencyAlert: (alert: CurrencyAlert) => Promise<void>;
  deleteCurrencyAlert: (id: string) => Promise<void>;
  updateLoan: (loan: Loan) => Promise<void>;
  updateFixedDeposit: (fd: FixedDeposit) => Promise<void>;
  updateRecurringDeposit: (rd: RecurringDeposit) => Promise<void>;
  updateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  updateInsurance: (policy: Insurance) => Promise<void>;
  updateCardReward: (reward: CardReward) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const DataAggregator = ({ children }: { children: ReactNode }) => {
  console.log('[DataAggregator] render');
  const auth = useAuth();
  const userCtx = useUserContext();
  const accountsCtx = useAccountsContext();
  const transactionsCtx = useTransactionsContext();
  const cardsCtx = useCardsContext();
  const billsCtx = useBillsContext();
  const notificationsCtx = useNotificationsContext();
  const budgetCtx = useBudgetContext();
  const ratesCtx = useCurrencyRatesContext();
  const contactsCtx = useContactsContext();
  const paymentRequestsCtx = usePaymentRequestsContext();
  const recurringTransfersCtx = useRecurringTransfersContext();
  const currencyAlertsCtx = useCurrencyAlertsContext();
  const loansCtx = useLoansContext();
  const fdsCtx = useFDsContext();
  const rdsCtx = useRDsContext();
  const goalsCtx = useGoalsContext();
  const insuranceCtx = useInsuranceContext();
  const rewardsCtx = useRewardsContext();

  const loading =
    userCtx.loading ||
    accountsCtx.loading ||
    transactionsCtx.loading ||
    cardsCtx.loading ||
    billsCtx.loading ||
    notificationsCtx.loading ||
    budgetCtx.loading ||
    ratesCtx.loading ||
    contactsCtx.loading ||
    paymentRequestsCtx.loading ||
    recurringTransfersCtx.loading ||
    currencyAlertsCtx.loading ||
    loansCtx.loading ||
    fdsCtx.loading ||
    rdsCtx.loading ||
    goalsCtx.loading ||
    insuranceCtx.loading ||
    rewardsCtx.loading;

  const value: DataContextValue = {
    user: userCtx.user,
    accounts: accountsCtx.accounts,
    transactions: transactionsCtx.transactions,
    cards: cardsCtx.cards,
    recurringBills: billsCtx.recurringBills,
    notifications: notificationsCtx.notifications,
    budgetCategories: budgetCtx.budgetCategories,
    currencyRates: ratesCtx.currencyRates,
    contacts: contactsCtx.contacts,
    paymentRequests: paymentRequestsCtx.paymentRequests,
    recurringTransfers: recurringTransfersCtx.recurringTransfers,
    currencyAlerts: currencyAlertsCtx.currencyAlerts,
    loans: loansCtx.loans,
    fixedDeposits: fdsCtx.fixedDeposits,
    recurringDeposits: rdsCtx.recurringDeposits,
    savingsGoals: goalsCtx.savingsGoals,
    insurance: insuranceCtx.insurance,
    cardRewards: rewardsCtx.cardRewards,
    loading,
    isAuthenticated: auth.isAuthenticated,

    login: auth.login,
    logout: auth.logout,
    forgotPassword: auth.forgotPassword,
    resetPassword: auth.resetPassword,
    updateUser: userCtx.updateUser,
    updateAccount: accountsCtx.updateAccount,
    addAccount: accountsCtx.addAccount,
    addTransaction: transactionsCtx.addTransaction,
    updateCard: cardsCtx.updateCard,
    addRecurringBill: billsCtx.addRecurringBill,
    updateRecurringBill: billsCtx.updateRecurringBill,
    markNotificationRead: notificationsCtx.markNotificationRead,
    updateBudgetCategory: budgetCtx.updateBudgetCategory,
    addContact: contactsCtx.addContact,
    updateContact: contactsCtx.updateContact,
    addPaymentRequest: paymentRequestsCtx.addPaymentRequest,
    updatePaymentRequest: paymentRequestsCtx.updatePaymentRequest,
    addRecurringTransfer: recurringTransfersCtx.addRecurringTransfer,
    updateRecurringTransfer: recurringTransfersCtx.updateRecurringTransfer,
    addCurrencyAlert: currencyAlertsCtx.addCurrencyAlert,
    updateCurrencyAlert: currencyAlertsCtx.updateCurrencyAlert,
    deleteCurrencyAlert: currencyAlertsCtx.deleteCurrencyAlert,
    updateLoan: loansCtx.updateLoan,
    updateFixedDeposit: fdsCtx.updateFixedDeposit,
    updateRecurringDeposit: rdsCtx.updateRecurringDeposit,
    updateSavingsGoal: goalsCtx.updateSavingsGoal,
    updateInsurance: insuranceCtx.updateInsurance,
    updateCardReward: rewardsCtx.updateCardReward,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  console.log('[DataProvider] render');
  return (
    <AuthProvider>
      <UserProvider>
        <AccountsProvider>
          <TransactionsProvider>
            <CardsProvider>
              <BillsProvider>
                <NotificationsProvider>
                  <BudgetProvider>
                    <CurrencyRatesProvider>
                      <ContactsProvider>
                        <PaymentRequestsProvider>
                          <RecurringTransfersProvider>
                            <CurrencyAlertsProvider>
                              <LoansProvider>
                                <FDsProvider>
                                  <RDsProvider>
                                    <GoalsProvider>
                                      <InsuranceProvider>
                                        <RewardsProvider>
                                          <DataAggregator>
                                            {children}
                                          </DataAggregator>
                                        </RewardsProvider>
                                      </InsuranceProvider>
                                    </GoalsProvider>
                                  </RDsProvider>
                                </FDsProvider>
                              </LoansProvider>
                            </CurrencyAlertsProvider>
                          </RecurringTransfersProvider>
                        </PaymentRequestsProvider>
                      </ContactsProvider>
                    </CurrencyRatesProvider>
                  </BudgetProvider>
                </NotificationsProvider>
              </BillsProvider>
            </CardsProvider>
          </TransactionsProvider>
        </AccountsProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
