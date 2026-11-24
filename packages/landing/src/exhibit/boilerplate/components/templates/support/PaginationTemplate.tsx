'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Record {
  id: number;
  name: string;
}

const TOTAL = 25;
const PAGE_SIZE = 5;
const TOTAL_PAGES = Math.ceil(TOTAL / PAGE_SIZE);

const RECORDS: Record[] = Array.from({ length: TOTAL }, (_, i) => ({
  id: i + 1,
  name: `Record ${i + 1}`,
}));

const PAGE_NUMBERS = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

export const PaginationTemplate: FC = () => {
  const [page, setPage] = useState(1);

  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, TOTAL);
  const visible = RECORDS.slice(start, end);

  const goToPage = (pageNumber: number) => {
    setPage(Math.min(Math.max(1, pageNumber), TOTAL_PAGES));
  };

  return (
    <div className="bg-base-100 text-base-content flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Pagination
          </p>
          <h1>Pagination</h1>
          <p className="text-base-content/50 text-sm">
            A list of records paginated five per page.
          </p>
        </div>

        <div className="card border-base-content/10 bg-base-200 border">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <h3>Records</h3>
              <span className="text-base-content/60 text-sm">
                Showing {start + 1}-{end} of {TOTAL}
              </span>
            </div>

            <ul className="flex flex-col gap-2 text-sm">
              {visible.map((record) => (
                <li
                  key={record.id}
                  className="bg-base-300/40 flex items-center gap-3 rounded-lg px-3 py-2">
                  <span className="text-base-content/40 font-mono text-xs">
                    #{String(record.id).padStart(2, '0')}
                  </span>
                  <span className="font-medium">{record.name}</span>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="btn btn-ghost btn-sm gap-1">
                <FiChevronLeft className="h-4 w-4" />
                Prev
              </button>
              {PAGE_NUMBERS.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  aria-label={`Go to page ${pageNumber}`}
                  onClick={() => goToPage(pageNumber)}
                  className={`btn btn-sm ${
                    pageNumber === page ? 'btn-primary' : 'btn-ghost'
                  }`}>
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                aria-label="Next page"
                onClick={() => goToPage(page + 1)}
                disabled={page >= TOTAL_PAGES}
                className="btn btn-ghost btn-sm gap-1">
                Next
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

PaginationTemplate.displayName = 'PaginationTemplate';
