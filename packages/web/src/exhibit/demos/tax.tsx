'use client';

import { type FC } from 'react';
import { DashboardTemplate } from '@/exhibit/components/tax/templates/DashboardTemplate';
import { useData } from '@/exhibit/providers/tax/DataProvider';
import {
  SUBMISSION_STATUS_LABELS,
  AUDIT_STATUS_LABELS,
} from '@/exhibit/lib/tax/constants';
import { TAX_TYPE_LABELS } from '@/exhibit/lib/tax/constants';
import Link from 'next/link';
import { Providers } from '@/exhibit/providers/tax/Providers';

const BusinessDashboardPage: FC = () => {
  const { submissions, audits, companies } = useData();

  const recentSubmissions = [...submissions]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  const recentAudits = [...audits]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  const pendingSubmissions = submissions.filter(
    (s) => s.status === 'draft' || s.status === 'submitted'
  ).length;
  const flaggedAudits = audits.filter((a) => a.status === 'flagged').length;

  const statusClass: Record<string, string> = {
    draft: 'badge-ghost',
    submitted: 'badge-info',
    accepted: 'badge-success',
    rejected: 'badge-error',
    amended: 'badge-warning',
    pending: 'badge-ghost',
    in_progress: 'badge-info',
    completed: 'badge-success',
    flagged: 'badge-error',
  };

  return (
    <DashboardTemplate>
      <div className="space-y-6">
        <div>
          <h1>Doanh Nghiep</h1>
          <p className="text-base-content/50 text-sm">
            Quan ly thue doanh nghiep
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="stat bg-base-200 rounded-box border-base-300 border p-4">
            <div className="stat-title text-xs">Doanh nghiep</div>
            <div className="stat-value text-2xl">{companies.length}</div>
          </div>
          <div className="stat bg-base-200 rounded-box border-base-300 border p-4">
            <div className="stat-title text-xs">Khai bao</div>
            <div className="stat-value text-primary text-2xl">
              {submissions.length}
            </div>
          </div>
          <div className="stat bg-base-200 rounded-box border-base-300 border p-4">
            <div className="stat-title text-xs">Cho xu ly</div>
            <div className="stat-value text-warning text-2xl">
              {pendingSubmissions}
            </div>
          </div>
          <div className="stat bg-base-200 rounded-box border-base-300 border p-4">
            <div className="stat-title text-xs">Kiem toan</div>
            <div className="stat-value text-error text-2xl">
              {flaggedAudits}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-medium">Khai bao gan day</h2>
            <Link
              href="/design-system/exhibits/tax"
              className="link link-primary text-xs">
              Xem tat ca
            </Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <p className="text-base-content/50 text-sm">Chua co khai bao</p>
          ) : (
            <div className="space-y-2">
              {recentSubmissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/design-system/exhibits/tax`}
                  className="bg-base-200 hover:bg-base-300 flex items-center justify-between rounded-lg p-3 transition-colors">
                  <div>
                    <p className="text-sm font-medium">
                      {TAX_TYPE_LABELS[sub.taxType]}
                    </p>
                    <p className="text-base-content/50 text-xs">
                      {sub.period} | {sub.companyName}
                    </p>
                  </div>
                  <span className={`badge badge-sm ${statusClass[sub.status]}`}>
                    {SUBMISSION_STATUS_LABELS[sub.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-medium">Kiem toan gan day</h2>
            <Link href="/design-system/exhibits/tax" className="link link-primary text-xs">
              Xem tat ca
            </Link>
          </div>
          {recentAudits.length === 0 ? (
            <p className="text-base-content/50 text-sm">Chua co kiem toan</p>
          ) : (
            <div className="space-y-2">
              {recentAudits.map((audit) => (
                <Link
                  key={audit.id}
                  href={`/design-system/exhibits/tax`}
                  className="bg-base-200 hover:bg-base-300 flex items-center justify-between rounded-lg p-3 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{audit.companyName}</p>
                    <p className="text-base-content/50 text-xs">
                      {audit.auditType} | Risk: {audit.riskScore}
                    </p>
                  </div>
                  <span
                    className={`badge badge-sm ${statusClass[audit.status]}`}>
                    {AUDIT_STATUS_LABELS[audit.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardTemplate>
  );
};

const TaxDemo = () => (
  <Providers>
    <BusinessDashboardPage />
  </Providers>
);

export default TaxDemo;
