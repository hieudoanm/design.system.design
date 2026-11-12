'use client';

import Link from 'next/link';
import { type FC } from 'react';
import type { TaxSubmission } from '@/exhibit/types/tax';
import { formatCurrency, formatDate } from '@/exhibit/utils/tax/format';
import { TAX_TYPE_LABELS, SUBMISSION_STATUS_LABELS } from '@/exhibit/lib/tax/constants';

interface SubmissionListProps {
  submissions: TaxSubmission[];
}

const statusClass: Record<string, string> = {
  draft: 'badge-ghost',
  submitted: 'badge-info',
  accepted: 'badge-success',
  rejected: 'badge-error',
  amended: 'badge-warning',
};

export const SubmissionList: FC<SubmissionListProps> = ({ submissions }) => {
  if (submissions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-base-content/50">Chua co khai bao nao</p>
        <Link href="/design-system/exhibits/tax" className="btn btn-primary btn-sm mt-4">
          Tao khai bao moi
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((sub) => (
        <Link
          key={sub.id}
          href={`/design-system/exhibits/tax`}
          className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors">
          <div className="card-body p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium">
                  {TAX_TYPE_LABELS[sub.taxType] ?? sub.taxType}
                </h3>
                <p className="text-base-content/50 mt-1 text-xs">
                  {sub.companyName}
                </p>
                <p className="text-base-content/50 text-xs">Ky: {sub.period}</p>
              </div>
              <div className="text-right">
                <span className={`badge badge-sm ${statusClass[sub.status]}`}>
                  {SUBMISSION_STATUS_LABELS[sub.status]}
                </span>
                {sub.totalTaxAmount > 0 && (
                  <p className="text-primary mt-2 text-sm font-medium">
                    {formatCurrency(sub.totalTaxAmount)}
                  </p>
                )}
              </div>
            </div>
            <div className="text-base-content/40 mt-2 flex justify-between text-[10px]">
              <span>Deadline: {formatDate(sub.deadline)}</span>
              <span>{sub.documents.length} ho so</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
