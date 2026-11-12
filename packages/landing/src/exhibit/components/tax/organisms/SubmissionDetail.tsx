'use client';

import { type FC } from 'react';
import type { TaxSubmission } from '@/exhibit/types/tax';
import { formatCurrency, formatDate } from '@/exhibit/utils/tax/format';
import { TAX_TYPE_LABELS, SUBMISSION_STATUS_LABELS } from '@/exhibit/lib/tax/constants';

interface SubmissionDetailProps {
  submission: TaxSubmission;
}

const statusClass: Record<string, string> = {
  draft: 'badge-ghost',
  submitted: 'badge-info',
  accepted: 'badge-success',
  rejected: 'badge-error',
  amended: 'badge-warning',
};

const docStatusClass: Record<string, string> = {
  pending: 'badge-ghost',
  uploaded: 'badge-info',
  verified: 'badge-success',
};

export const SubmissionDetail: FC<SubmissionDetailProps> = ({ submission }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-box border-base-300 bg-base-200 border p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium">
              {TAX_TYPE_LABELS[submission.taxType]}
            </h2>
            <p className="text-base-content/50 text-sm">
              {submission.companyName}
            </p>
          </div>
          <span className={`badge ${statusClass[submission.status]}`}>
            {SUBMISSION_STATUS_LABELS[submission.status]}
          </span>
        </div>

        <div className="divider" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-base-content/50 text-xs">Ky ke khai</span>
            <p className="font-medium">{submission.period}</p>
          </div>
          <div>
            <span className="text-base-content/50 text-xs">Han nop</span>
            <p className="font-medium">{formatDate(submission.deadline)}</p>
          </div>
          <div>
            <span className="text-base-content/50 text-xs">Ngay nop</span>
            <p className="font-medium">
              {submission.submittedAt
                ? formatDate(submission.submittedAt)
                : 'Chua nop'}
            </p>
          </div>
          <div>
            <span className="text-base-content/50 text-xs">Tien thue</span>
            <p className="text-primary font-medium">
              {submission.totalTaxAmount > 0
                ? formatCurrency(submission.totalTaxAmount)
                : 'Chua tinh'}
            </p>
          </div>
        </div>

        {submission.notes && (
          <div className="bg-base-300 mt-3 rounded-lg p-3 text-sm">
            <span className="text-base-content/50 text-xs">Ghi chu:</span>
            <p>{submission.notes}</p>
          </div>
        )}
      </div>

      <div className="rounded-box border-base-300 bg-base-200 border p-4">
        <h3 className="mb-3 text-sm font-medium">Ho so dinh kem</h3>
        {submission.documents.length === 0 ? (
          <p className="text-base-content/50 text-xs">Chua co ho so</p>
        ) : (
          <div className="space-y-2">
            {submission.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-base-300 flex items-center justify-between rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-base-content/50 text-xs">{doc.type}</p>
                </div>
                <span
                  className={`badge badge-sm ${docStatusClass[doc.status]}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
