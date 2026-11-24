import type { FC } from 'react';

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
  siblingCount?: number;
}

const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

const buildPages = (
  current: number,
  total: number,
  siblingCount: number
): (number | 'ellipsis')[] => {
  if (total <= 1) return [1];
  const pages = new Set<number>([1, total]);
  const start = Math.max(2, current - siblingCount);
  const end = Math.min(total - 1, current + siblingCount);
  for (let page = start; page <= end; page += 1) pages.add(page);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const withEllipsis: (number | 'ellipsis')[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1)
      withEllipsis.push('ellipsis');
    withEllipsis.push(page);
  });
  return withEllipsis;
};

export const Pagination: FC<PaginationProps> = ({
  current,
  total,
  onChange,
  siblingCount = 1,
}) => {
  const safeTotal = total <= 0 ? 1 : total;
  const safeCurrent = clamp(current, 1, safeTotal);
  const pages = buildPages(safeCurrent, safeTotal, siblingCount);

  const go = (page: number) => {
    if (page < 1 || page > safeTotal || page === safeCurrent) return;
    onChange(page);
  };

  return (
    <nav aria-label="Pagination" className="join">
      <button
        aria-label="Previous page"
        className="join-item btn btn-sm"
        disabled={safeCurrent === 1}
        onClick={() => go(safeCurrent - 1)}>
        ‹
      </button>
      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <button
            key={`e${index}`}
            className="join-item btn btn-sm btn-disabled"
            disabled>
            …
          </button>
        ) : (
          <button
            key={page}
            aria-label={`Page ${page}`}
            aria-current={page === safeCurrent ? 'page' : undefined}
            className={`join-item btn btn-sm ${
              page === safeCurrent ? 'btn-primary' : ''
            }`}
            onClick={() => go(page)}>
            {page}
          </button>
        )
      )}
      <button
        aria-label="Next page"
        className="join-item btn btn-sm"
        disabled={safeCurrent === safeTotal}
        onClick={() => go(safeCurrent + 1)}>
        ›
      </button>
    </nav>
  );
};
