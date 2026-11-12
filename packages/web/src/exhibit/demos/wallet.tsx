'use client';

import { DashboardTemplate } from '@/exhibit/components/wallet/templates';
import {
  BalanceCard,
  AccountCard,
  TransactionItem,
} from '@/exhibit/components/wallet/atoms';
import Skeleton, {
  SkeletonText,
  SkeletonCard,
} from '@/exhibit/components/wallet/atoms/Skeleton';
import { QuickActions } from '@/exhibit/components/wallet/molecules';
import { useData } from '@/exhibit/providers/wallet/DataProvider';
import Link from 'next/link';
import { WalletProviders } from '@/exhibit/providers/wallet/WalletProviders';

const HomePage = () => {
  const { user, accounts, transactions, loading } = useData();
  console.log('[HomePage] render', { loading, accounts: accounts.length });

  if (loading) {
    return (
      <DashboardTemplate>
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <SkeletonText className="h-7 w-1/2" />
            <SkeletonText className="w-2/3" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="rounded-btn h-10 flex-1" />
            <Skeleton className="rounded-btn h-10 flex-1" />
            <Skeleton className="rounded-btn h-10 flex-1" />
            <Skeleton className="rounded-btn h-10 flex-1" />
          </div>
          <div className="space-y-2">
            <SkeletonText className="h-5 w-1/3" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardTemplate>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const recentTransactions = transactions.slice(0, 5);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <DashboardTemplate>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {firstName}
          </h1>
          <p className="text-base-content/60">
            Here&apos;s your financial overview
          </p>
        </div>

        <BalanceCard amount={totalBalance} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>

        <QuickActions />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link
              href="/design-system/exhibits/wallet"
              className="text-primary text-sm hover:underline">
              View all
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {recentTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} showDate />
            ))}
          </div>
        </div>
      </div>
    </DashboardTemplate>
  );
};

const WalletDemo = () => (
  <WalletProviders>
    <HomePage />
  </WalletProviders>
);

export default WalletDemo;
