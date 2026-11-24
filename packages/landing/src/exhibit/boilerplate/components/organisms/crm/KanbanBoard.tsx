import type { FC } from 'react';

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tag?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
}

const tagClass: Record<string, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

export const KanbanBoard: FC<KanbanBoardProps> = ({ columns }) => (
  <div className="flex w-full gap-4 overflow-x-auto pb-2">
    {columns.map((column) => (
      <section
        key={column.id}
        aria-label={column.title}
        className="bg-base-200 flex w-64 shrink-0 flex-col gap-2 rounded-xl p-3">
        <header className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium">{column.title}</h3>
          <span className="badge badge-ghost badge-sm">
            {column.cards.length}
          </span>
        </header>
        <div className="flex min-h-16 flex-col gap-2">
          {column.cards.length === 0 && (
            <p className="text-base-content/40 text-center text-sm">Empty</p>
          )}
          {column.cards.map((card) => (
            <article
              key={card.id}
              className="bg-base-100 border-base-content/10 flex flex-col gap-1 rounded-xl border p-3 shadow-sm">
              <h4 className="text-sm font-medium">{card.title}</h4>
              {card.description && (
                <p className="text-base-content/60 text-sm">
                  {card.description}
                </p>
              )}
              {card.tag && (
                <span
                  className={`badge badge-sm w-fit ${tagClass[card.tag] ?? 'badge-ghost'}`}>
                  {card.tag}
                </span>
              )}
            </article>
          ))}
        </div>
      </section>
    ))}
  </div>
);

KanbanBoard.displayName = 'KanbanBoard';
