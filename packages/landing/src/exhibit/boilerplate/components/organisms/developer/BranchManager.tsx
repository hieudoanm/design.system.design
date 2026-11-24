'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface Branch {
  id: string;
  name: string;
  ahead?: number;
  behind?: number;
  updated?: string;
}

interface BranchManagerProps {
  branches: Branch[];
  currentBranch?: string;
  onCheckout?: (branchId: string) => void;
}

export const BranchManager: FC<BranchManagerProps> = ({
  branches,
  currentBranch,
  onCheckout,
}) => {
  const [selected, setSelected] = useState(
    currentBranch ?? branches[0]?.id ?? ''
  );

  const checkout = (branchId: string) => {
    setSelected(branchId);
    onCheckout?.(branchId);
  };

  return (
    <section className="card bg-base-200 border-base-content/10 rounded-xl border">
      <div className="card-body">
        <header className="flex items-center justify-between">
          <h2 className="card-title text-base">Branches</h2>
          <span className="badge badge-ghost">{branches.length}</span>
        </header>
        <ul className="flex flex-col gap-2">
          {branches.map((branch) => (
            <li key={branch.id}>
              <button
                data-testid="branch-item"
                className={`btn btn-outline btn-sm w-full justify-start ${
                  branch.id === selected ? 'btn-primary' : ''
                }`}
                onClick={() => checkout(branch.id)}>
                <span aria-hidden="true">
                  {branch.id === selected ? '⦿' : '◌'}
                </span>
                <span className="font-mono text-xs">{branch.name}</span>
                <span className="ml-auto flex gap-1">
                  {branch.ahead !== undefined && branch.ahead > 0 && (
                    <span className="badge badge-success badge-xs">
                      ↑{branch.ahead}
                    </span>
                  )}
                  {branch.behind !== undefined && branch.behind > 0 && (
                    <span className="badge badge-warning badge-xs">
                      ↓{branch.behind}
                    </span>
                  )}
                </span>
              </button>
              {branch.updated && (
                <p className="text-base-content/40 mt-1 pl-8 text-xs">
                  Updated {branch.updated}
                </p>
              )}
            </li>
          ))}
        </ul>
        <button
          data-testid="branch-checkout"
          className="btn btn-primary btn-sm mt-2"
          disabled={selected === ''}
          onClick={() => onCheckout?.(selected)}>
          Checkout selected branch
        </button>
      </div>
    </section>
  );
};
