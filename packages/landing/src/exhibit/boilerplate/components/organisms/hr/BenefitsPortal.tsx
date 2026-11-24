import type { FC } from 'react';

interface Benefit {
  id: string;
  title: string;
  description: string;
  coverage?: string;
  icon?: string;
}

interface BenefitsPortalProps {
  benefits: Benefit[];
}

export const BenefitsPortal: FC<BenefitsPortalProps> = ({ benefits }) => (
  <div
    className="grid w-full grid-cols-1 gap-4 md:grid-cols-3"
    data-testid="benefits-portal">
    {benefits.map((benefit) => (
      <article
        key={benefit.id}
        className="card bg-base-200 border-base-content/10 border">
        <div className="card-body">
          <div className="text-2xl">{benefit.icon ?? '🎁'}</div>
          <h3 className="card-title text-base">{benefit.title}</h3>
          <p className="text-base-content/60 text-sm">{benefit.description}</p>
          {benefit.coverage && (
            <div className="mt-1">
              <span className="badge badge-primary badge-sm">
                {benefit.coverage}
              </span>
            </div>
          )}
          <div className="mt-2">
            <button type="button" className="btn btn-ghost btn-sm">
              View details
            </button>
          </div>
        </div>
      </article>
    ))}
    {benefits.length === 0 && (
      <div className="card bg-base-200 border-base-content/10 col-span-full border">
        <div className="card-body text-center">
          <p className="text-base-content/40 text-sm">No benefits available</p>
        </div>
      </div>
    )}
  </div>
);

BenefitsPortal.displayName = 'BenefitsPortal';
