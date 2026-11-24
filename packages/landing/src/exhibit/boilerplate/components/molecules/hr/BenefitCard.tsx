import type { FC } from 'react';

interface BenefitCardProps {
  title: string;
  description: string;
  category?: string;
  icon?: string;
  className?: string;
}

export const BenefitCard: FC<BenefitCardProps> = ({
  title,
  description,
  category,
  icon = '✦',
  className = '',
}) => {
  return (
    <article
      data-testid="benefit-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="bg-primary text-primary-content flex h-10 w-10 items-center justify-center rounded-full text-lg">
          {icon}
        </span>
        <h3 className="text-base font-medium">{title}</h3>
      </div>
      <p className="text-base-content/70 mt-3 text-sm leading-relaxed">
        {description}
      </p>
      {category && (
        <div className="mt-3">
          <span className="badge badge-outline badge-sm">{category}</span>
        </div>
      )}
    </article>
  );
};
