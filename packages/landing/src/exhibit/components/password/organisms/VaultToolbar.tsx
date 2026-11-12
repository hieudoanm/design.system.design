'use client';

import { type FC, type RefObject } from 'react';
import { FiCheckSquare, FiSearch, FiSquare } from 'react-icons/fi';
import type { Folder } from '@/exhibit/types/password';

export type SortKey = 'updated' | 'name' | 'used';
export type DateFilter = 'all' | 'week' | 'month' | 'quarter';

interface VaultToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  folders: Folder[];
  folderFilter: string | null;
  onFolderFilterChange: (value: string | null) => void;
  allTags: string[];
  tagFilter: string | null;
  onTagFilterChange: (value: string | null) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (value: DateFilter) => void;
}

export const VaultToolbar: FC<VaultToolbarProps> = ({
  search,
  onSearchChange,
  searchRef,
  sort,
  onSortChange,
  selectMode,
  onToggleSelectMode,
  folders,
  folderFilter,
  onFolderFilterChange,
  allTags,
  tagFilter,
  onTagFilterChange,
  dateFilter,
  onDateFilterChange,
}) => (
  <div className="mb-4 space-y-2">
    <div className="flex items-center gap-2">
      <FiSearch className="size-4 shrink-0 opacity-50" />
      <input
        ref={searchRef}
        type="text"
        placeholder="Search vault..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="input input-sm flex-1"
      />
      <select
        aria-label="Sort items"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        className="select select-sm hidden sm:block">
        <option value="updated">Date modified</option>
        <option value="name">Name</option>
        <option value="used">Most used</option>
      </select>
      <button
        type="button"
        onClick={onToggleSelectMode}
        className="btn btn-ghost btn-sm">
        {selectMode ? (
          <FiCheckSquare className="size-4" />
        ) : (
          <FiSquare className="size-4" />
        )}
        {selectMode ? 'Cancel' : 'Select'}
      </button>
    </div>
    <div className="hidden gap-2 sm:flex">
      <select
        aria-label="Filter by folder"
        value={folderFilter ?? ''}
        onChange={(e) =>
          onFolderFilterChange(e.target.value === '' ? null : e.target.value)
        }
        className="select select-sm flex-1">
        <option value="">All folders</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by tag"
        value={tagFilter ?? ''}
        onChange={(e) =>
          onTagFilterChange(e.target.value === '' ? null : e.target.value)
        }
        className="select select-sm flex-1">
        <option value="">All tags</option>
        {allTags.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by date"
        value={dateFilter}
        onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
        className="select select-sm">
        <option value="all">Any time</option>
        <option value="week">Last 7 days</option>
        <option value="month">Last 30 days</option>
        <option value="quarter">Last 90 days</option>
      </select>
    </div>
  </div>
);
