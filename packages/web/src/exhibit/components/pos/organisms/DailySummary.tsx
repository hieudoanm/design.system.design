'use client';

import { type FC, useMemo } from 'react';
import {
  PanelHeader,
  PAYMENT_LABELS,
  PaymentBreakdown,
  StatBlock,
  TopItemsList,
} from '@/exhibit/components/pos/molecules';
import { buildSalesReport } from '@/exhibit/lib/pos';
import type { Transaction } from '@/exhibit/types/pos';

interface DailySummaryProps {
  transactions: Transaction[];
  onBack: () => void;
}

const getToday = (): string => new Date().toISOString().split('T')[0];

export const DailySummary: FC<DailySummaryProps> = ({
  transactions,
  onBack,
}) => {
  const today = getToday();

  const todayTxns = useMemo(
    () =>
      transactions.filter(
        (t) => t.createdAt.startsWith(today) && t.status === 'completed'
      ),
    [transactions, today]
  );

  const summary = useMemo(() => buildSalesReport(todayTxns), [todayTxns]);

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Daily Summary" onBack={onBack}>
        <span className="text-base-content/50 text-xs">{today}</span>
      </PanelHeader>
      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        <StatBlock
          title="Transactions"
          count={summary.count}
          totalSales={summary.totalSales}
          totalTax={summary.totalTax}
        />

        <h2 className="mb-2 text-sm font-semibold">By Payment Method</h2>
        <PaymentBreakdown
          byPayment={summary.byPayment}
          labels={PAYMENT_LABELS}
        />

        <h2 className="mb-2 text-sm font-semibold">Top Items</h2>
        <TopItemsList items={summary.topItems} emptyMessage="No sales today" />
      </main>
    </div>
  );
};
