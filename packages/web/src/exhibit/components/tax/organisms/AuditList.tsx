'use client';

import Link from 'next/link';
import { type FC } from 'react';
import type { TaxAudit } from '@/exhibit/types/tax';
import { formatDate } from '@/exhibit/utils/tax/format';
import { AUDIT_STATUS_LABELS } from '@/exhibit/lib/tax/constants';

interface AuditListProps {
  audits: TaxAudit[];
}

const statusClass: Record<string, string> = {
  pending: 'badge-ghost',
  in_progress: 'badge-info',
  completed: 'badge-success',
  flagged: 'badge-error',
};

const getRiskColor = (score: number): string => {
  if (score <= 20) return 'text-success';
  if (score <= 50) return 'text-warning';
  return 'text-error';
};

export const AuditList: FC<AuditListProps> = ({ audits }) => {
  if (audits.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-base-content/50">Chua co kiem toan nao</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {audits.map((audit) => (
        <Link
          key={audit.id}
          href={`/design-system/exhibits/tax`}
          className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors">
          <div className="card-body p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium">{audit.companyName}</h3>
                <p className="text-base-content/50 mt-1 text-xs">
                  Loai: {audit.auditType}
                </p>
                <p className="text-base-content/50 text-xs">
                  Kiem toan vien: {audit.auditor}
                </p>
              </div>
              <div className="text-right">
                <span className={`badge badge-sm ${statusClass[audit.status]}`}>
                  {AUDIT_STATUS_LABELS[audit.status]}
                </span>
                <p
                  className={`mt-2 text-lg font-bold ${getRiskColor(audit.riskScore)}`}>
                  {audit.riskScore}
                </p>
                <p className="text-base-content/50 text-[10px]">Risk score</p>
              </div>
            </div>
            <div className="text-base-content/40 mt-2 flex justify-between text-[10px]">
              <span>Bat dau: {formatDate(audit.startDate)}</span>
              <span>
                {audit.findings.length} van de |{' '}
                {audit.checks.filter((c) => c.passed === false).length} that bai
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
