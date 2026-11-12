import { FC, useState } from 'react';
import {
  FiSearch,
  FiCalendar,
  FiX,
  FiDollarSign,
  FiFilter,
} from 'react-icons/fi';

const CATEGORIES = [
  'All',
  'Food & Drink',
  'Transport',
  'Shopping',
  'Utilities',
  'Entertainment',
  'Income',
  'Transfer',
];

interface TransactionFiltersProps {
  search: string;
  filter: 'all' | 'income' | 'expense';
  dateFrom: string;
  dateTo: string;
  category: string;
  amountMin: string;
  amountMax: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'income' | 'expense') => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAmountMinChange: (value: string) => void;
  onAmountMaxChange: (value: string) => void;
}

const TransactionFilters: FC<TransactionFiltersProps> = ({
  search,
  filter,
  dateFrom,
  dateTo,
  category,
  amountMin,
  amountMax,
  onSearchChange,
  onFilterChange,
  onDateFromChange,
  onDateToChange,
  onCategoryChange,
  onAmountMinChange,
  onAmountMaxChange,
}) => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasDateFilter = dateFrom || dateTo;
  const hasAdvanced = category !== 'All' || amountMin || amountMax;

  return (
    <>
      <div className="relative">
        <FiSearch className="text-base-content/40 absolute top-1/2 left-3 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search transactions..."
          className="input input-bordered w-full pl-10"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn'}`}
            onClick={() => onFilterChange(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        <button
          className={`btn btn-sm gap-1 ${hasDateFilter ? 'btn-primary' : 'btn'}`}
          onClick={() => setShowDateFilter(!showDateFilter)}>
          <FiCalendar className="text-sm" />
          Date
          {hasDateFilter && (
            <FiX
              className="ml-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDateFromChange('');
                onDateToChange('');
              }}
            />
          )}
        </button>

        <button
          className={`btn btn-sm gap-1 ${hasAdvanced ? 'btn-primary' : 'btn'}`}
          onClick={() => setShowAdvanced(!showAdvanced)}>
          <FiFilter className="text-sm" />
          Filters
          {hasAdvanced && (
            <FiX
              className="ml-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryChange('All');
                onAmountMinChange('');
                onAmountMaxChange('');
              }}
            />
          )}
        </button>
      </div>

      {showDateFilter && (
        <div className="bg-base-200 flex flex-wrap items-center gap-3 rounded-lg p-3">
          <label className="floating-label">
            <span>From</span>
            <input
              type="date"
              className="input input-bordered input-sm"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </label>
          <label className="floating-label">
            <span>To</span>
            <input
              type="date"
              className="input input-bordered input-sm"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </label>
        </div>
      )}

      {showAdvanced && (
        <div className="bg-base-200 flex flex-wrap items-end gap-3 rounded-lg p-3">
          <label className="floating-label">
            <span>Category</span>
            <select
              className="select select-bordered select-sm"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="floating-label">
            <span>Min Amount</span>
            <div className="relative">
              <FiDollarSign className="text-base-content/40 absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                type="number"
                placeholder="0"
                className="input input-bordered input-sm w-28 pl-8"
                value={amountMin}
                onChange={(e) => onAmountMinChange(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </label>

          <label className="floating-label">
            <span>Max Amount</span>
            <div className="relative">
              <FiDollarSign className="text-base-content/40 absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                type="number"
                placeholder="∞"
                className="input input-bordered input-sm w-28 pl-8"
                value={amountMax}
                onChange={(e) => onAmountMaxChange(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </label>
        </div>
      )}
    </>
  );
};

export default TransactionFilters;
