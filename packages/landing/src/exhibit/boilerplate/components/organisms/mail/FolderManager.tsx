'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface Folder {
  id: string;
  name: string;
  count: number;
}

interface FolderManagerProps {
  folders: Folder[];
  onAdd?: (name: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
}

export const FolderManager: FC<FolderManagerProps> = ({
  folders,
  onAdd,
  onRename,
  onDelete,
}) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const addFolder = (): void => {
    const name = newName.trim();
    if (name) {
      onAdd?.(name);
      setNewName('');
    }
  };

  const startRename = (folder: Folder): void => {
    setEditingId(folder.id);
    setEditingName(folder.name);
  };

  const commitRename = (): void => {
    if (editingId && editingName.trim()) {
      onRename?.(editingId, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      className="bg-base-200 border-base-content/10 flex w-full flex-col gap-4 rounded-xl border p-4"
      data-testid="folder-manager">
      <div className="form-control flex flex-row gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New folder name"
          aria-label="New folder name"
          className="input input-bordered input-sm flex-1"
        />
        <button
          type="button"
          onClick={addFolder}
          className="btn btn-primary btn-sm">
          Add
        </button>
      </div>
      <ul className="flex flex-col gap-1">
        {folders.map((folder) => (
          <li
            key={folder.id}
            className="hover:bg-base-300/60 flex items-center gap-2 rounded-lg px-3 py-2">
            {editingId === folder.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  aria-label="Folder name"
                  className="input input-bordered input-xs flex-1"
                />
                <button
                  type="button"
                  onClick={commitRename}
                  className="btn btn-success btn-xs">
                  Save
                </button>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">{folder.name}</span>
                <span className="badge badge-ghost badge-sm ml-auto">
                  {folder.count}
                </span>
                <button
                  type="button"
                  onClick={() => startRename(folder)}
                  className="btn btn-ghost btn-xs">
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(folder.id)}
                  className="btn btn-ghost btn-xs text-error">
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
        {folders.length === 0 && (
          <li className="text-base-content/40 text-center text-sm">
            No folders yet
          </li>
        )}
      </ul>
    </div>
  );
};

FolderManager.displayName = 'FolderManager';
