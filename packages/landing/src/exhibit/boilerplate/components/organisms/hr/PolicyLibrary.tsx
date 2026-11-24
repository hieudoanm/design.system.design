import type { FC } from 'react';

interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  updated: string;
  status: 'active' | 'draft' | 'archived';
}

interface PolicyLibraryProps {
  policies: Policy[];
}

const statusClass: Record<Policy['status'], string> = {
  active: 'badge-success',
  draft: 'badge-warning',
  archived: 'badge-ghost',
};

export const PolicyLibrary: FC<PolicyLibraryProps> = ({ policies }) => (
  <div className="flex w-full flex-col gap-4" data-testid="policy-library">
    <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-xl border">
      <table className="table-compact table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Version</th>
            <th>Updated</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => (
            <tr key={policy.id}>
              <td className="font-medium">{policy.title}</td>
              <td>
                <span className="badge badge-ghost badge-sm">
                  {policy.category}
                </span>
              </td>
              <td>{policy.version}</td>
              <td>{policy.updated}</td>
              <td>
                <span
                  className={`badge badge-sm ${statusClass[policy.status]}`}>
                  {policy.status}
                </span>
              </td>
            </tr>
          ))}
          {policies.length === 0 && (
            <tr>
              <td colSpan={5} className="text-base-content/40 text-center">
                No policies published
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

PolicyLibrary.displayName = 'PolicyLibrary';
