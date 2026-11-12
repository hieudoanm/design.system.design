import { db } from '@/exhibit/lib/wallet/db';
import {
  user as seedUser,
  accounts as seedAccounts,
  transactions as seedTransactions,
  cards as seedCards,
  recurringBills as seedRecurringBills,
  notifications as seedNotifications,
  budgetCategories as seedBudgetCategories,
  currencyRates as seedCurrencyRates,
  contacts as seedContacts,
  paymentRequests as seedPaymentRequests,
  recurringTransfers as seedRecurringTransfers,
  currencyAlerts as seedCurrencyAlerts,
  loans as seedLoans,
  fixedDeposits as seedFixedDeposits,
  recurringDeposits as seedRecurringDeposits,
  savingsGoals as seedSavingsGoals,
  insurance as seedInsurance,
  cardRewards as seedCardRewards,
} from '@/exhibit/data/wallet/mock';

let seedPromise: Promise<void> | null = null;

const seedAll = async () => {
  console.log('[seed] seeding all stores');
  const results = await Promise.allSettled([
    db.put(db.STORES.user, seedUser),
    db.putAll(db.STORES.accounts, seedAccounts),
    db.putAll(db.STORES.transactions, seedTransactions),
    db.putAll(db.STORES.cards, seedCards),
    db.putAll(db.STORES.recurringBills, seedRecurringBills),
    db.putAll(db.STORES.notifications, seedNotifications),
    db.putAll(db.STORES.budgetCategories, seedBudgetCategories),
    db.putAll(db.STORES.currencyRates, seedCurrencyRates),
    db.putAll(db.STORES.contacts, seedContacts),
    db.putAll(db.STORES.paymentRequests, seedPaymentRequests),
    db.putAll(db.STORES.recurringTransfers, seedRecurringTransfers),
    db.putAll(db.STORES.currencyAlerts, seedCurrencyAlerts),
    db.putAll(db.STORES.loans, seedLoans),
    db.putAll(db.STORES.fixedDeposits, seedFixedDeposits),
    db.putAll(db.STORES.recurringDeposits, seedRecurringDeposits),
    db.putAll(db.STORES.savingsGoals, seedSavingsGoals),
    db.putAll(db.STORES.insurance, seedInsurance),
    db.putAll(db.STORES.cardRewards, seedCardRewards),
  ]);
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    console.warn('[seed] some stores failed:', failed.length);
    failed.forEach((r, i) =>
      console.warn(`[seed] store[${i}]`, (r as PromiseRejectedResult).reason)
    );
  }
  console.log('[seed] seeding complete', {
    ok: results.length - failed.length,
    failed: failed.length,
  });
};

export const ensureSeeded = (): Promise<void> => {
  if (!seedPromise) {
    seedPromise = db
      .needsSeed()
      .then(async (needs) => {
        if (needs) await seedAll();
      })
      .catch((err) => {
        console.error('[seed] ensureSeeded failed', err);
        seedPromise = null;
        throw err;
      });
  }
  return seedPromise;
};
