import type { FC, ReactNode } from 'react';

interface InfoCard {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  accent?: 'neutral' | 'primary' | 'success' | 'warning' | 'error';
}

interface InfoCardsProps {
  cards: InfoCard[];
  columns?: 2 | 3 | 4;
  title?: string;
}

const ACCENT: Record<NonNullable<InfoCard['accent']>, string> = {
  neutral: 'text-base-content',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

const GRID: Record<NonNullable<InfoCardsProps['columns']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export const InfoCards: FC<InfoCardsProps> = ({
  cards,
  columns = 3,
  title,
}) => (
  <div className="flex w-full flex-col gap-4">
    {title && <h3 className="text-lg font-medium">{title}</h3>}
    <div className={`grid grid-cols-1 gap-4 ${GRID[columns]}`}>
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-base-200 border-base-content/10 flex flex-col gap-2 rounded-2xl border p-5">
          {card.icon && (
            <span className={`text-2xl ${ACCENT[card.accent ?? 'neutral']}`}>
              {card.icon}
            </span>
          )}
          <h4 className="text-sm font-semibold">{card.title}</h4>
          {card.description && (
            <p className="text-base-content/50 text-sm">{card.description}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);
