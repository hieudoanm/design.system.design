'use client';

import { type FC, useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { Money } from '@/exhibit/components/pos/atoms';
import {
  FilterTabs,
  PanelHeader,
  PaymentBreakdown,
  StatBlock,
  TopItemsList,
} from '@/exhibit/components/pos/molecules';
import {
  buildSalesReport,
  buildSalesReportCsv,
  downloadTextFile,
  filterCompletedInPeriod,
  getSalesReportFilename,
} from '@/exhibit/lib/pos';
import type { ReportPeriod, Transaction } from '@/exhibit/types/pos';

const PERIODS: ReportPeriod[] = ['daily', 'weekly', 'monthly'];

const TOP_ITEM_LIMIT = 10;

interface ReportingDashboardProps {
  transactions: Transaction[];
  onBack: () => void;
}

export const ReportingDashboard: FC<ReportingDashboardProps> = ({
  transactions,
  onBack,
}) => {
  const [period, setPeriod] = useState<ReportPeriod>('daily');

  const filteredTxns = useMemo(
    () => filterCompletedInPeriod(transactions, period),
    [transactions, period]
  );

  const report = useMemo(
    () => buildSalesReport(filteredTxns, TOP_ITEM_LIMIT),
    [filteredTxns]
  );

  const exportCsv = () => {
    const today = new Date().toISOString().split('T')[0];
    downloadTextFile(
      buildSalesReportCsv(filteredTxns),
      getSalesReportFilename(period, today),
      'text/csv'
    );
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Reports" onBack={onBack}>
        <button
          className="btn btn-ghost btn-sm ml-auto gap-1"
          onClick={exportCsv}>
          <FiDownload className="size-4" />
          CSV
        </button>
      </PanelHeader>

      <FilterTabs
        tabs={PERIODS.map((p) => ({
          key: p,
          label: p,
          activeClass: 'btn-primary',
          className: 'capitalize',
        }))}
        active={period}
        onSelect={(key) => setPeriod(key as ReportPeriod)}
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        <StatBlock
          title="Transactions"
          count={report.count}
          totalSales={report.totalSales}
          totalTax={report.totalTax}
        />

        <h2 className="mb-2 text-sm font-semibold">Payment Breakdown</h2>
        <PaymentBreakdown byPayment={report.byPayment} capitalize />

        <h2 className="mb-2 text-sm font-semibold">By Category</h2>
        <div className="mb-4">
          {Object.entries(report.byCategory).map(([category, amount]) => (
            <div
              key={category}
              className="flex justify-between border-b py-2 text-sm">
              <span>{category}</span>
              <Money amount={amount} className="font-bold" />
            </div>
          ))}
        </div>

        <h2 className="mb-2 text-sm font-semibold">Top Items</h2>
        <TopItemsList
          items={report.topItems}
          emptyMessage="No sales in this period"
        />
      </main>
    </div>
  );
};
