'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiEdit2,
  FiFilter,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

interface TableRow {
  id: number;
  name: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending';
  amount: number;
}

const INITIAL_ROWS: TableRow[] = [
  {
    id: 1,
    name: 'Alice Smith',
    category: 'Finance',
    status: 'Active',
    amount: 1200,
  },
  {
    id: 2,
    name: 'Bob Jones',
    category: 'Sales',
    status: 'Pending',
    amount: 340,
  },
  {
    id: 3,
    name: 'Cara Lee',
    category: 'Engineering',
    status: 'Active',
    amount: 2500,
  },
  {
    id: 4,
    name: 'Dan Kim',
    category: 'Marketing',
    status: 'Inactive',
    amount: 780,
  },
  {
    id: 5,
    name: 'Eve Chen',
    category: 'Support',
    status: 'Active',
    amount: 150,
  },
  {
    id: 6,
    name: 'Frank Wu',
    category: 'Finance',
    status: 'Pending',
    amount: 940,
  },
  {
    id: 7,
    name: 'Grace Tan',
    category: 'Sales',
    status: 'Active',
    amount: 4100,
  },
  {
    id: 8,
    name: 'Hank Vu',
    category: 'Engineering',
    status: 'Inactive',
    amount: 610,
  },
];

const STATUS_BADGE: Record<TableRow['status'], string> = {
  Active: 'badge-success',
  Inactive: 'badge-ghost',
  Pending: 'badge-warning',
};

const PAGE_SIZES = [3, 5];

type StatusFilter = 'All' | TableRow['status'];
type SortKey = 'name' | 'amount';
type SortDir = 'asc' | 'desc';

export const DataTableTemplate: FC = () => {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const startEdit = (row: TableRow) => {
    setEditingId(row.id);
    setEditValue(row.name);
  };

  const saveEdit = () => {
    setRows(
      rows.map((r) => (r.id === editingId ? { ...r, name: editValue } : r))
    );
    setEditingId(null);
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const filtered = rows.filter((row) => {
    const matchesQuery =
      row.name.toLowerCase().includes(query.toLowerCase()) ||
      row.category.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
    return (a.amount - b.amount) * dir;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);
  const caret =
    sortDir === 'asc' ? (
      <FiChevronUp className="h-4 w-4" />
    ) : (
      <FiChevronDown className="h-4 w-4" />
    );

  const sortButton = (label: string, key: SortKey, text: string) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => toggleSort(key)}
      className="flex items-center gap-1 font-medium uppercase">
      {text}
      {sortKey === key && caret}
    </button>
  );

  const actionButtons = (row: TableRow) => {
    if (editingId === row.id) {
      return (
        <>
          <button
            type="button"
            aria-label={`Save ${row.name}`}
            onClick={saveEdit}
            className="btn btn-ghost btn-xs">
            <FiCheck className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Cancel edit"
            onClick={() => setEditingId(null)}
            className="btn btn-ghost btn-xs">
            <FiX className="h-4 w-4" />
          </button>
        </>
      );
    }
    return (
      <>
        <button
          type="button"
          aria-label={`Edit ${row.name}`}
          onClick={() => startEdit(row)}
          className="btn btn-ghost btn-xs">
          <FiEdit2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${row.name}`}
          onClick={() => deleteRow(row.id)}
          className="btn btn-ghost btn-xs text-error">
          <FiTrash2 className="h-4 w-4" />
        </button>
      </>
    );
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Data
          </p>
          <h1>Data table</h1>
          <p className="text-base-content/50 text-sm">
            Sort, search, paginate, edit and delete mock rows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <FiSearch className="text-base-content/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search rows"
              placeholder="Search by name or category..."
              className="input input-bordered w-full pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2">
            <FiFilter className="text-base-content/40 h-4 w-4" />
            <select
              aria-label="Filter by status"
              className="select select-bordered select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </label>
        </div>

        <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-2xl border">
          <table className="table-zebra table">
            <thead>
              <tr>
                <th>{sortButton('Sort by name', 'name', 'Name')}</th>
                <th>Category</th>
                <th>Status</th>
                <th>{sortButton('Sort by amount', 'amount', 'Amount')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    {editingId === row.id ? (
                      <input
                        aria-label="Edit name"
                        className="input input-bordered input-sm"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
                    ) : (
                      <span className="font-medium">{row.name}</span>
                    )}
                  </td>
                  <td className="text-base-content/60">{row.category}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${STATUS_BADGE[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="font-mono">${row.amount.toLocaleString()}</td>
                  <td>
                    <div className="flex gap-1">{actionButtons(row)}</div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-base-content/50 py-10 text-center">
                    No rows match
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="btn btn-ghost btn-sm gap-1">
            <FiChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-base-content/60 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-base-content/60 text-sm">Rows</span>
              <select
                aria-label="Rows per page"
                className="select select-bordered select-sm"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}>
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="btn btn-ghost btn-sm gap-1">
              Next
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

DataTableTemplate.displayName = 'DataTableTemplate';
