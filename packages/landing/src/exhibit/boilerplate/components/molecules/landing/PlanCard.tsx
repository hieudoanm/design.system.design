import type { FC } from 'react';

interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta?: string;
  recommended?: boolean;
  note?: string;
  className?: string;
}

export const PlanCard: FC<PlanCardProps> = ({
  name,
  price,
  period = '/month',
  features = [],
  cta = 'Choose plan',
  recommended = false,
  note,
  className = '',
}) => {
  const muted = recommended
    ? 'text-primary-content/70'
    : 'text-base-content/50';

  return (
    <article
      data-testid="plan-card"
      className={`card border p-6 ${
        recommended
          ? 'bg-primary text-primary-content border-primary shadow-lg'
          : 'bg-base-200 border-base-content/10'
      } ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">{name}</h3>
        {recommended && (
          <span className="badge badge-secondary badge-sm">Recommended</span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold">{price}</span>
        {period && <span className={`text-sm ${muted}`}>{period}</span>}
      </div>
      <ul className="mt-4 flex flex-col gap-2 text-sm">
        {features.map((feature, index) => (
          <li key={`${feature}-${index}`} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={recommended ? 'text-primary-content' : 'text-success'}>
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      {note && <p className={`mt-4 text-xs ${muted}`}>{note}</p>}
      <button
        type="button"
        className={`btn mt-6 w-full ${recommended ? 'btn-neutral' : 'btn-primary'}`}>
        {cta}
      </button>
    </article>
  );
};
