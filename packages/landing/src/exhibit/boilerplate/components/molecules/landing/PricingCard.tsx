import type { FC } from 'react';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta?: string;
  highlighted?: boolean;
  className?: string;
}

export const PricingCard: FC<PricingCardProps> = ({
  name,
  price,
  period = '/mo',
  features = [],
  cta = 'Get started',
  highlighted = false,
  className = '',
}) => {
  const muted = highlighted
    ? 'text-primary-content/70'
    : 'text-base-content/50';
  const check = highlighted ? 'text-primary-content' : 'text-success';

  return (
    <article
      data-testid="pricing-card"
      className={`card border p-6 ${
        highlighted
          ? 'bg-primary text-primary-content border-primary shadow-lg'
          : 'bg-base-200 border-base-content/10'
      } ${className}`}>
      <h3 className="text-sm font-medium tracking-wide uppercase">{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold">{price}</span>
        {period && <span className={`text-sm ${muted}`}>{period}</span>}
      </div>
      <ul className="mt-4 flex flex-col gap-2 text-sm">
        {features.map((feature, index) => (
          <li key={`${feature}-${index}`} className="flex items-center gap-2">
            <span aria-hidden="true" className={check}>
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`btn mt-6 w-full ${highlighted ? 'btn-neutral' : 'btn-primary'}`}>
        {cta}
      </button>
    </article>
  );
};
