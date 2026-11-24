'use client';

import type { FC } from 'react';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  members: number;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

interface WorkspaceGridProps {
  workspaces: Workspace[];
  onCreate?: () => void;
}

const COLOR_BG: Record<NonNullable<Workspace['color']>, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

export const WorkspaceGrid: FC<WorkspaceGridProps> = ({
  workspaces,
  onCreate,
}) => (
  <div
    data-testid="workspace-grid"
    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {workspaces.length === 0 && (
      <div className="bg-base-100 border-base-300 card col-span-full border border-dashed">
        <div className="card-body items-center text-center">
          <p className="text-base-content/50 text-sm">No workspaces yet.</p>
          {onCreate && (
            <button
              type="button"
              data-testid="create-workspace"
              className="btn btn-primary btn-sm"
              onClick={onCreate}>
              Create workspace
            </button>
          )}
        </div>
      </div>
    )}
    {workspaces.map((workspace) => (
      <article
        key={workspace.id}
        data-testid={`workspace-${workspace.id}`}
        className="card bg-base-100 border-base-200 border shadow-sm">
        <div className="card-body">
          <span
            className={`badge ${COLOR_BG[workspace.color ?? 'primary']} badge-xs w-8`}
          />
          <h3 className="card-title text-base">{workspace.name}</h3>
          {workspace.description && (
            <p className="text-base-content/60 text-sm">
              {workspace.description}
            </p>
          )}
          <p className="text-base-content/50 mt-2 text-xs">
            {workspace.members} {workspace.members === 1 ? 'member' : 'members'}
          </p>
        </div>
      </article>
    ))}
    {workspaces.length > 0 && onCreate && (
      <button
        type="button"
        data-testid="new-workspace"
        onClick={onCreate}
        className="btn hover:bg-base-200 card border-base-300 text-base-content/50 min-h-40 border border-dashed">
        + New workspace
      </button>
    )}
  </div>
);
