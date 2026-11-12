'use client';

import { type FC, useState } from 'react';
import { FiEdit2, FiFolder, FiTrash2, FiUsers, FiX } from 'react-icons/fi';
import type { Folder } from '@/exhibit/types/password';

interface FolderManagerProps {
  folders: Folder[];
  onCreate: (name: string, isTeam: boolean) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleTeam: (id: string) => void;
  onClose: () => void;
}

export const FolderManager: FC<FolderManagerProps> = ({
  folders,
  onCreate,
  onRename,
  onDelete,
  onToggleTeam,
  onClose,
}) => {
  const [newName, setNewName] = useState('');
  const [newTeam, setNewTeam] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (): void => {
    if (!newName.trim()) return;
    onCreate(newName, newTeam);
    setNewName('');
    setNewTeam(false);
  };

  const startEdit = (folder: Folder): void => {
    setEditingId(folder.id);
    setEditName(folder.name);
  };

  const submitEdit = (id: string): void => {
    if (editName.trim()) onRename(id, editName);
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 card w-full max-w-md shadow-xl">
        <div className="card-body">
          <div className="card-title flex justify-between">
            Manage Folders
            <button
              type="button"
              onClick={onClose}
              aria-label="Close folder manager"
              className="btn btn-ghost btn-sm btn-circle">
              <FiX className="size-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New folder name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
              className="input input-bordered flex-1"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="btn btn-primary">
              Create
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newTeam}
              onChange={(e) => setNewTeam(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <FiUsers className="size-4" /> Create as team vault
          </label>
          <div className="mt-2 space-y-2">
            {folders.length === 0 && (
              <p className="text-base-content/50 py-4 text-center text-sm">
                No folders yet
              </p>
            )}
            {folders.map((f) => (
              <div
                key={f.id}
                className="bg-base-200 flex items-center gap-2 rounded-lg p-2">
                <FiFolder className="size-4 shrink-0 opacity-50" />
                {editingId === f.id ? (
                  <input
                    type="text"
                    aria-label={`Rename folder ${f.name}`}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitEdit(f.id);
                    }}
                    onBlur={() => submitEdit(f.id)}
                    className="input input-sm input-bordered flex-1"
                  />
                ) : (
                  <span className="flex-1 text-sm">
                    {f.name}
                    {f.isTeam && (
                      <span className="badge badge-primary badge-sm ml-2">
                        Team
                      </span>
                    )}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Toggle team vault ${f.name}`}
                  onClick={() => onToggleTeam(f.id)}
                  className="btn btn-ghost btn-xs btn-circle">
                  <FiUsers
                    className={`size-3 ${f.isTeam ? 'text-primary' : 'opacity-40'}`}
                  />
                </button>
                <button
                  type="button"
                  aria-label={`Rename ${f.name}`}
                  onClick={() => startEdit(f)}
                  className="btn btn-ghost btn-xs btn-circle">
                  <FiEdit2 className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete folder ${f.name}`}
                  onClick={() => onDelete(f.id)}
                  className="btn btn-ghost btn-xs btn-circle text-error">
                  <FiTrash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
