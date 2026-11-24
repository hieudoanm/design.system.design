import Link from '@/exhibit/boilerplate/link';
import { FiCheck } from 'react-icons/fi';
import type { FC } from 'react';

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  ctaHref: string;
}

interface PricingSectionProps {
  plans: PricingPlan[];
}

export const PricingSection: FC<PricingSectionProps> = ({ plans }) => (
  <div className="grid gap-6 md:grid-cols-3">
    {plans.map((plan) => (
      <div
        key={plan.name}
        className={`card ${
          plan.highlighted
            ? 'border-primary bg-primary/5'
            : 'bg-base-200 border-base-content/10 border'
        }`}>
        <div className="card-body">
          <h3 className="card-title">{plan.name}</h3>
          {plan.description && (
            <p className="text-base-content/50 text-sm">{plan.description}</p>
          )}
          <div className="mt-2 flex items-end gap-1">
            <span className="text-3xl font-medium">{plan.price}</span>
            {plan.period && (
              <span className="text-base-content/50 text-sm">
                {plan.period}
              </span>
            )}
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <FiCheck
                  className={plan.highlighted ? 'text-primary' : 'text-success'}
                />
                {feature}
              </li>
            ))}
          </ul>
          <div className="card-actions mt-6">
            <Link
              href={plan.ctaHref}
              className={`btn btn-block ${plan.highlighted ? 'btn-primary' : 'btn-outline'}`}>
              {plan.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    ))}
  </div>
);
