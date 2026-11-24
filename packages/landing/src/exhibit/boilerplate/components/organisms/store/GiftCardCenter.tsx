import type { FC } from 'react';

interface GiftCard {
  id: string;
  recipient: string;
  amount: number;
  status: 'Pending' | 'Sent' | 'Claimed';
  delivery?: string;
}

interface GiftCardCenterProps {
  cards: GiftCard[];
}

const STATUS_CLASS: Record<GiftCard['status'], string> = {
  Pending: 'badge-warning',
  Sent: 'badge-info',
  Claimed: 'badge-success',
};

export const GiftCardCenter: FC<GiftCardCenterProps> = ({ cards }) => {
  return (
    <section data-testid="gift-card-center" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Gift cards</h2>
        <button type="button" className="btn btn-primary btn-sm">
          + New gift card
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.id} className="card bg-base-200">
            <div className="card-body gap-2 p-4">
              <div className="flex items-start justify-between">
                <span className="text-2xl" aria-hidden="true">
                  &#127873;
                </span>
                <span className={`badge ${STATUS_CLASS[card.status]}`}>
                  {card.status}
                </span>
              </div>
              <p className="text-base-content/50 text-xs">To</p>
              <h3 className="text-sm font-medium">{card.recipient}</h3>
              <p className="text-xl font-semibold">${card.amount.toFixed(2)}</p>
              {card.delivery && (
                <p className="text-base-content/50 text-xs">
                  Delivered {card.delivery}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
