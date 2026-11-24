'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiDownload,
  FiFile,
  FiFolder,
  FiSearch,
  FiUpload,
} from 'react-icons/fi';

type SortKey = 'name' | 'size';

interface FileEntry {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: number | null;
  modified: string;
}

const INITIAL_FILES: FileEntry[] = [
  { id: 'f1', name: 'reports', type: 'folder', size: null, modified: 'Aug 02' },
  {
    id: 'f2',
    name: 'invoice.pdf',
    type: 'file',
    size: 245,
    modified: 'Aug 01',
  },
  { id: 'f3', name: 'logo.png', type: 'file', size: 1280, modified: 'Jul 28' },
  { id: 'f4', name: 'readme.txt', type: 'file', size: 48, modified: 'Jul 20' },
];

const formatSize = (size: number | null): string =>
  size === null ? '—' : `${size} KB`;

export const FilesTemplate: FC = () => {
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');

  const query = search.trim().toLowerCase();
  const filtered = files.filter((file) =>
    file.name.toLowerCase().includes(query)
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'size') {
      return (
        (a.size ?? Number.MAX_SAFE_INTEGER) -
        (b.size ?? Number.MAX_SAFE_INTEGER)
      );
    }
    return a.name.localeCompare(b.name);
  });

  const uploadFile = () => {
    setFiles((prev) => [
      {
        id: `f${Date.now()}`,
        name: 'uploaded.txt',
        type: 'file',
        size: 12,
        modified: 'Just now',
      },
      ...prev,
    ]);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Files</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Browse and manage files in your workspace.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xs">
            <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="input input-bordered input-sm bg-base-200 w-full pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Sort by"
              className="select select-bordered select-sm">
              <option value="name">Sort by name</option>
              <option value="size">Sort by size</option>
            </select>
            <button onClick={uploadFile} className="btn btn-primary btn-sm">
              <FiUpload />
              Upload
            </button>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10">
                <FiFile className="text-base-content/30 h-8 w-8" />
                <p className="text-base-content/50 text-sm">No files</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Size</th>
                      <th className="px-4 py-3 font-medium">Modified</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((file) => (
                      <tr
                        key={file.id}
                        className="border-base-content/10 border-b">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {file.type === 'folder' ? (
                              <FiFolder className="text-primary h-4 w-4 shrink-0" />
                            ) : (
                              <FiFile className="text-base-content/50 h-4 w-4 shrink-0" />
                            )}
                            <span className="text-sm font-medium">
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{file.type}</td>
                        <td className="px-4 py-3 text-sm">
                          {formatSize(file.size)}
                        </td>
                        <td className="px-4 py-3 text-sm">{file.modified}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            aria-label={`Download ${file.name}`}
                            className="text-base-content/50 inline-flex">
                            <FiDownload className="h-4 w-4" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

FilesTemplate.displayName = 'FilesTemplate';
