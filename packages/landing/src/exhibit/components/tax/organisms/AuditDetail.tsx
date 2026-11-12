'use client';

import { type FC } from 'react';
import type { TaxAudit } from '@/exhibit/types/tax';
import { formatDate } from '@/exhibit/utils/tax/format';
import { AUDIT_STATUS_LABELS } from '@/exhibit/lib/tax/constants';

interface AuditDetailProps {
  audit: TaxAudit;
}

const statusClass: Record<string, string> = {
  pending: 'badge-ghost',
  in_progress: 'badge-info',
  completed: 'badge-success',
  flagged: 'badge-error',
};

const severityClass: Record<string, string> = {
  low: 'badge-info',
  medium: 'badge-warning',
  high: 'badge-error',
  critical: 'badge-error',
};

const checkIcon = (passed: boolean | null): string => {
  if (passed === null) return '⏳';
  return passed ? '✅' : '❌';
};

export const AuditDetail: FC<AuditDetailProps> = ({ audit }) => {
  const passedChecks = audit.checks.filter((c) => c.passed === true).length;
  const totalChecks = audit.checks.length;

  return (
    <div className="space-y-4">
      <div className="rounded-box border-base-300 bg-base-200 border p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium">{audit.companyName}</h2>
            <p className="text-base-content/50 text-sm">
              {audit.auditType} | Kiem toan vien: {audit.auditor}
            </p>
          </div>
          <span className={`badge ${statusClass[audit.status]}`}>
            {AUDIT_STATUS_LABELS[audit.status]}
          </span>
        </div>

        <div className="divider" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-base-content/50 text-xs">Ngay bat dau</span>
            <p className="font-medium">{formatDate(audit.startDate)}</p>
          </div>
          <div>
            <span className="text-base-content/50 text-xs">Ngay ket thuc</span>
            <p className="font-medium">
              {audit.endDate ? formatDate(audit.endDate) : 'Dang tien hanh'}
            </p>
          </div>
          <div>
            <span className="text-base-content/50 text-xs">Risk Score</span>
            <p
              className={`text-2xl font-bold ${
                audit.riskScore <= 20
                  ? 'text-success'
                  : audit.riskScore <= 50
                    ? 'text-warning'
                    : 'text-error'
              }`}>
              {audit.riskScore}/100
            </p>
          </div>
          <div>
            <span className="text-base-content/50 text-xs">Kiem tra</span>
            <p className="font-medium">
              {passedChecks}/{totalChecks} pass
            </p>
          </div>
        </div>

        {audit.notes && (
          <div className="bg-base-300 mt-3 rounded-lg p-3 text-sm">
            <span className="text-base-content/50 text-xs">Ghi chu:</span>
            <p>{audit.notes}</p>
          </div>
        )}
      </div>

      <div className="rounded-box border-base-300 bg-base-200 border p-4">
        <h3 className="mb-3 text-sm font-medium">Chi tiet kiem tra</h3>
        <div className="space-y-2">
          {audit.checks.map((check) => (
            <div
              key={check.id}
              className="bg-base-300 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span>{checkIcon(check.passed)}</span>
                <div>
                  <p className="text-sm font-medium">{check.name}</p>
                  <p className="text-base-content/50 text-xs">
                    {check.description}
                  </p>
                </div>
              </div>
              {check.details && (
                <p className="text-base-content/50 max-w-[200px] text-right text-xs">
                  {check.details}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {audit.findings.length > 0 && (
        <div className="rounded-box border-base-300 bg-base-200 border p-4">
          <h3 className="mb-3 text-sm font-medium">
            Van de phat hien ({audit.findings.length})
          </h3>
          <div className="space-y-3">
            {audit.findings.map((finding) => (
              <div
                key={finding.id}
                className={`rounded-lg border p-3 ${
                  finding.resolved
                    ? 'border-success/30 bg-success/5'
                    : 'border-error/30 bg-error/5'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge badge-sm ${severityClass[finding.severity]}`}>
                        {finding.severity}
                      </span>
                      <span className="text-base-content/50 text-xs">
                        {finding.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{finding.description}</p>
                    {finding.amount && (
                      <p className="text-primary mt-1 text-xs font-medium">
                        {finding.amount.toLocaleString()} VND
                      </p>
                    )}
                    <p className="text-base-content/50 mt-1 text-xs">
                      De xuat: {finding.recommendation}
                    </p>
                  </div>
                  <span className="text-lg">
                    {finding.resolved ? '✅' : '⚠️'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
