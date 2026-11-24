import Link from '@/exhibit/boilerplate/link';
import { FiCheck } from 'react-icons/fi';
import type { FC } from 'react';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaLabel: string;
  ctaHref?: string;
  onCta?: () => void;
  highlighted?: boolean;
  badge?: string;
  className?: string;
}

export const PricingCard: FC<PricingCardProps> = ({
  name,
  price,
  period,
  description,
  features,
  ctaLabel,
  ctaHref,
  onCta,
  highlighted = false,
  badge,
  className = '',
}) => (
  <div
    className={`card ${
      highlighted
        ? 'border-primary bg-primary/5 border-2'
        : 'bg-base-200 border-base-content/10 border'
    } ${className}`}>
    <div className="card-body">
      <div className="flex items-center justify-between">
        <h3 className="card-title">{name}</h3>
        {badge && <span className="badge badge-primary">{badge}</span>}
      </div>
      {description && (
        <p className="text-base-content/50 text-sm">{description}</p>
      )}
      <div className="mt-2 flex items-end gap-1">
        <span className="text-4xl font-medium">{price}</span>
        {period && (
          <span className="text-base-content/50 text-sm">{period}</span>
        )}
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <FiCheck
              className={highlighted ? 'text-primary' : 'text-success'}
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>
      <div className="card-actions mt-6">
        {ctaHref ? (
          <Link
            href={ctaHref}
            className={`btn btn-block ${
              highlighted ? 'btn-primary' : 'btn-outline'
            }`}>
            {ctaLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onCta}
            className={`btn btn-block ${
              highlighted ? 'btn-primary' : 'btn-outline'
            }`}>
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);
